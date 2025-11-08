import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { from, to, text } = await request.json();

    const client = await clientPromise;
    const db = client.db('counseling');
    
    await db.collection('messages').insertOne({
      from,
      to,
      text,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}