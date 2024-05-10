import { NextResponse } from 'next/server';

interface FormValues {
  radius: string;
}

export async function POST(request: Request) {
  const { radius }: FormValues = await request.json();

  console.log(radius)
  console.log(typeof radius)

  // Check if the radius is provided and handle empty or invalid inputs
  if (radius === "" || radius === null || radius === undefined || (typeof radius === "string" && radius.trim().length === 0)) {
    console.error('Server Error: Radius must be provided');
    return NextResponse.json({ error: 'Radius must be provided' }, { status: 400 });
  }

  const isString = typeof radius === "string";
  if (isString && !/^\d*\.?\d+$/.test(radius)) {
    console.error('Server Error: Invalid radius value', { radius });
    return NextResponse.json({ error: 'Radius must be numeric' }, { status: 400 });
  }

  // Convert the valid string to a number
  const radiusNum = isString ? parseFloat(radius) : radius;

  // Check if the conversion to number was successful and the value is within range
  if (isNaN(radiusNum) || radiusNum < 1 || radiusNum > 100) {
    console.error('Server Error: Radius out of range or non-numeric', { radius: radiusNum });
    return NextResponse.json({ error: 'Radius must be between 1 and 100' }, { status: 400 });
  }

  // Calculate the area of the circle using the radius
  const area = Math.PI * Math.pow(radiusNum, 2);
  return NextResponse.json({ success: true, area: area.toFixed(2) });
}
