import { NextResponse } from 'next/server';

interface FormValues {
  radius: number;
}

export async function POST(request: Request) {
  const { radius }: FormValues = await request.json();

  // Ensure the radius is provided
  if (radius == null || radius === "") {
    console.error('Server Error: Radius must be provided');
    return NextResponse.json({ error: 'Radius must be provided' }, { status: 400 });
  }

  // Validate that the radius is numeric
  if (typeof radius !== 'number' || isNaN(radius)) {
    console.error('Server Error: Invalid radius value', { radius });
    return NextResponse.json({ error: 'Radius must be numeric' }, { status: 400 });
  }

  // Ensure the radius is within the allowed range
  if (radius < 1 || radius > 100) {
    console.error('Server Error: Radius out of range', { radius });
    return NextResponse.json({ error: 'Radius must be between 1 and 100' }, { status: 400 });
  }

  // Calculate the area
  const area = Math.PI * Math.pow(radius, 2);
  return NextResponse.json({ success: true, area: area.toFixed(2) });
}
