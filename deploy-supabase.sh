#!/bin/bash

echo "🚀 Deploying to Supabase..."

# Stop any local Supabase services
echo "⏹️  Stopping local Supabase services..."
supabase stop

# Link to remote project (you'll need to enter your project reference)
echo "🔗 Linking to remote Supabase project..."
supabase link --project-ref your-project-ref

# Deploy Edge Functions
echo "⚡ Deploying Edge Functions..."
supabase functions deploy whop-webhook

# Push database migrations
echo "📊 Pushing database migrations..."
supabase db push

# Start services again
echo "▶️  Starting local services..."
supabase start

echo "✅ Supabase deployment complete!"