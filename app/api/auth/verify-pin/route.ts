import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, message: 'PIN kodu gerekli.' },
        { status: 400 }
      );
    }

    const trimmedPin = pin.trim();
    const serverPin = (process.env.APP_PIN || '110795').trim();

    if (trimmedPin === serverPin) {
      return NextResponse.json({
        success: true,
        message: 'Doğrulandı.',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Hatalı PIN kodu.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('PIN verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu doğrulama hatası.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ demo: true });
}
