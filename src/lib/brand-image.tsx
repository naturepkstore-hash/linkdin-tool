import { createElement } from 'react';
import { ImageResponse } from 'next/og';
import { BRAND_PALETTE } from '@/config/brandingTheme';

export interface DailyImageOptions {
  dayNumber: number;
  topic: string;
  takeaways: string[];
}

function renderTakeaway(text: string, index: number) {
  const colors = [BRAND_PALETTE.purple, BRAND_PALETTE.magenta, BRAND_PALETTE.cyan];

  return createElement(
    'div',
    {
      key: `takeaway-${index}`,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: '20px 24px',
        width: '100%',
        borderRadius: 20,
        border: '1px solid #292b48',
        backgroundColor: '#101328',
      },
    },
    createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: colors[index],
          color: BRAND_PALETTE.white,
          fontSize: 24,
          fontWeight: 700,
          flexShrink: 0,
        },
      },
      String(index + 1).padStart(2, '0'),
    ),
    createElement(
      'div',
      {
        style: {
          display: 'flex',
          color: BRAND_PALETTE.softWhite,
          fontSize: 26,
          fontWeight: 500,
          lineHeight: 1.25,
        },
      },
      text,
    ),
  );
}

export async function generateBrandedDailyImage({
  dayNumber,
  topic,
  takeaways,
}: DailyImageOptions): Promise<Buffer> {
  const image = new ImageResponse(
    createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: 68,
          color: BRAND_PALETTE.white,
          backgroundColor: BRAND_PALETTE.background,
          backgroundImage: 'linear-gradient(135deg, #060814 0%, #0a0d1f 58%, #15102c 100%)',
          fontFamily: 'Arial',
          position: 'relative',
          overflow: 'hidden',
        },
      },
      createElement(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          },
        },
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              color: BRAND_PALETTE.cyanBright,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 3,
            },
          },
          `SEO GROWTH SERIES  /  DAY ${String(dayNumber).padStart(3, '0')}`,
        ),
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              width: 94,
              height: 7,
              borderRadius: 8,
              backgroundImage: 'linear-gradient(90deg, #a855f7, #ec4899, #22d3ee)',
            },
          },
        ),
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              maxWidth: 920,
              color: BRAND_PALETTE.white,
              fontSize: 61,
              fontWeight: 700,
              lineHeight: 1.12,
            },
          },
          topic.slice(0, 150),
        ),
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              color: '#b7bdd2',
              fontSize: 25,
              fontWeight: 400,
            },
          },
          'One practical SEO lesson. Built to compound.',
        ),
      ),
      createElement(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          },
        },
        ...takeaways.slice(0, 3).map(renderTakeaway),
      ),
      createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 18,
            borderTop: '1px solid #292b48',
            color: '#b7bdd2',
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: 2,
          },
        },
        createElement('div', { style: { display: 'flex', color: BRAND_PALETTE.white } }, 'POSTFLOW'),
        createElement('div', { style: { display: 'flex' } }, '365 DAYS  •  DAILY PROGRESS'),
      ),
      createElement('div', {
        style: {
          position: 'absolute',
          top: -190,
          right: -150,
          width: 500,
          height: 500,
          borderRadius: 250,
          border: '2px solid #442c70',
          opacity: 0.65,
        },
      }),
      createElement('div', {
        style: {
          position: 'absolute',
          top: -100,
          right: -65,
          width: 330,
          height: 330,
          borderRadius: 165,
          border: '2px solid #1b5570',
          opacity: 0.55,
        },
      }),
    ),
    { width: 1080, height: 1080 },
  );

  if (!image.ok) {
    throw new Error(`Branded daily image rendering failed with status ${image.status}.`);
  }

  const bytes = Buffer.from(await image.arrayBuffer());
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(pngSignature)) {
    throw new Error('Branded daily image renderer did not return a valid PNG.');
  }

  return bytes;
}
