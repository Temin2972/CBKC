import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('counseling');
    
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: 'Username exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = username === 'counselor' ? 'counselor' : 'student';
    
    const result = await db.collection('users').insertOne({
      username,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    });

    return NextResponse.json({
      user: { username, role, id: result.insertedId },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}