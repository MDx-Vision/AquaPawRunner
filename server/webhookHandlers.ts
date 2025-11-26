import { getStripeSync } from './stripeClient';
import { storage } from './storage';
import Stripe from 'stripe';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    const result = await sync.processWebhook(payload, signature, uuid);

    try {
      const event = JSON.parse(payload.toString()) as Stripe.Event;
      await this.handleStripeEvent(event);
    } catch (err: any) {
      console.log('Custom webhook processing error:', err.message);
    }
  }

  static async handleStripeEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await storage.updatePaymentByStripeIntent(paymentIntent.id, {
          status: 'succeeded',
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await storage.updatePaymentByStripeIntent(paymentIntent.id, {
          status: 'failed',
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          const paymentIntentId = typeof charge.payment_intent === 'string' 
            ? charge.payment_intent 
            : charge.payment_intent.id;
          
          await storage.updatePaymentByStripeIntent(paymentIntentId, {
            status: 'refunded',
            refundedAmount: charge.amount_refunded,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}
