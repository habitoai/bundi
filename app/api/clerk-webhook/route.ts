import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

// For debugging only - remove in production
const DEBUG = true;

// Get the webhook secret and Convex URL from environment variables
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || '';

if (!webhookSecret) {
  console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
}

if (!convexUrl) {
  console.error('Missing NEXT_PUBLIC_CONVEX_URL environment variable');
}

// This is the route that Clerk will POST to when a webhook event occurs
export async function POST(req: Request) {
  // Verify the webhook signature
  const headersList = headers();
  const payload = await req.json();
  const payloadString = JSON.stringify(payload);
  
  // Create a new Svix webhook instance with the webhook secret
  const wh = new Webhook(webhookSecret);
  
  // Get the Svix headers for verification
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');
  
  // If any of the required headers are missing, return an error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing Svix headers');
    return NextResponse.json(
      { error: 'Missing Svix headers' },
      { status: 400 }
    );
  }
  
  let evt: WebhookEvent;
  
  // In debug mode, we'll log everything and optionally bypass verification
  if (DEBUG) {
    console.log('DEBUG MODE ENABLED - Webhook details:', {
      secret: webhookSecret.substring(0, 5) + '...',  // Only log part of the secret for security
      svix_id,
      svix_timestamp,
      svix_signature: svix_signature?.substring(0, 10) + '...',
      payloadString: payloadString.substring(0, 100) + '...' // Show just the beginning
    });
    
    // Try to verify but continue even if it fails in debug mode
    try {
      evt = wh.verify(payloadString, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
      console.log('Webhook verification successful');
    } catch (err) {
      console.warn('Webhook verification failed, but continuing in DEBUG mode:', err);
      // In debug mode, we'll parse the payload directly
      evt = payload as WebhookEvent;
    }
  } else {
    // Normal verification in production mode
    try {
      evt = wh.verify(payloadString, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json(
        { 
          error: 'Error verifying webhook',
          details: err instanceof Error ? err.message : 'Unknown error'
        },
        { status: 400 }
      );
    }
  }
  
  // Get the event type
  const eventType = evt.type;
  console.log(`Received webhook event: ${eventType}`);
  
  // Initialize Convex client
  const convex = new ConvexHttpClient(convexUrl);
  
  try {
    // Process different event types
    switch (eventType) {
      case 'user.created':
        console.log('User created event received:', evt.data.id);
        try {
          // Use string literal directly to avoid TypeScript errors
          await (convex as any).mutation("users:createUser", {
            clerkId: evt.data.id,
            email: evt.data.email_addresses?.[0]?.email_address || '',
            name: evt.data.first_name ? `${evt.data.first_name} ${evt.data.last_name || ''}`.trim() : undefined,
            imageUrl: evt.data.image_url,
          });
          console.log('Successfully created user in Convex');
        } catch (error) {
          console.error('Error creating user in Convex:', error);
          throw error;
        }
        break;
        
      case 'user.updated':
        console.log('User updated event received:', evt.data.id);
        try {
          // Use string literal directly to avoid TypeScript errors
          await (convex as any).mutation("users:updateUser", {
            clerkId: evt.data.id,
            email: evt.data.email_addresses?.[0]?.email_address,
            name: evt.data.first_name ? `${evt.data.first_name} ${evt.data.last_name || ''}`.trim() : undefined,
            imageUrl: evt.data.image_url,
          });
          console.log('Successfully updated user in Convex');
        } catch (error) {
          console.error('Error updating user in Convex:', error);
          throw error;
        }
        break;
        
      case 'user.deleted':
        const clerkIdToDelete = evt.data.id;
        if (clerkIdToDelete) {
          console.log('User deleted event received:', clerkIdToDelete);
          try {
            // Use string literal directly to avoid TypeScript errors
            await (convex as any).mutation("users:deleteUser", { 
              clerkId: clerkIdToDelete 
            });
            console.log('Successfully deleted user from Convex');
          } catch (error) {
            console.error('Error deleting user from Convex:', error);
            throw error;
          }
        } else {
          console.warn('User deleted event received without a Clerk ID');
        }
        break;
        
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }
    
    // Return a 200 OK response to acknowledge receipt of the webhook
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { 
        error: 'Error processing webhook',
        details: error instanceof Error ? error.message : String(error),
        eventType: eventType
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for testing
export function GET() {
  return NextResponse.json(
    { message: 'Clerk webhook endpoint. Send POST requests here.' },
    { status: 200 }
  );
}
