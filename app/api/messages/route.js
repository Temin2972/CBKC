import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const partner = searchParams.get('partner');

    const client = await clientPromise;
    const db = client.db('counseling');
    
    const messages = await db.collection('messages')
      .find({
        $or: [
          { from: username, to: partner },
          { from: partner, to: username },
        ],
      })
      .sort({ timestamp: 1 })
      .toArray();

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}