import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('counseling');
    
    const messages = await db.collection('messages')
      .find({ to: 'counselor' })
      .toArray();

    const studentSet = new Set(messages.map(m => m.from));
    const students = Array.from(studentSet);

    return NextResponse.json({ students });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}