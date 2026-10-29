import { createElement } from 'react';
import { ImageResponse } from 'next/og';
import { BRAND_PALETTE } from '@/config/brandingTheme';

export interface DailyImageOptions {
  dayNumber: number;
  topic: string;
  takeaways: string[];
}

function renderTakeaway(text: string, index: number) {
  const colors = [BRAND_PALETTE.magenta, BRAND_PALETTE.cyanBright, BRAND_PALETTE.purple];
  const separator = text.indexOf(':');
  const heading = separator > 0 ? text.slice(0, separator) : text;
  const detail = separator > 0 ? text.slice(separator + 1).trim() : '';
  const detailLines: string[] = [];

  for (const word of detail.split(/\s+/)) {
    const lastLineIndex = detailLines.length - 1;
    const lastLine = detailLines[lastLineIndex];
    if (!lastLine) {
      detailLines.push(word);
    } else if (`${lastLine} ${word}`.length > 46) {
      detailLines.push(word);
    } else {
      detailLines[lastLineIndex] = `${lastLine} ${word}`;
    }
  }

  return createElement(
    'div',
    {
      key: `takeaway-${index}`,
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 8,
        flex: 1,
        minWidth: 0,
        minHeight: 128,
        padding: '15px 17px',
        borderRadius: 18,
        border: `1px solid ${index % 2 === 0 ? '#3d2869' : '#1c5269'}`,
        background: 'linear-gradient(145deg, #12152c 0%, #0c1022 100%)',
        boxShadow: `0 0 18px ${colors[index % colors.length]}22`,
      },
    },
    createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 11,
        },
      },
      createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 31,
            height: 31,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${colors[index % colors.length]}, #397eff)`,
            color: BRAND_PALETTE.white,
            fontSize: 15,
            fontWeight: 800,
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
            color: BRAND_PALETTE.white,
            flex: 1,
            minWidth: 0,
            fontSize: 19,
            fontWeight: 800,
            lineHeight: 1.15,
          },
        },
        heading,
      ),
    ),
    detailLines.length > 0
      ? createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              paddingLeft: 42,
            },
          },
          ...detailLines.map((line, lineIndex) =>
            createElement(
              'div',
              {
                key: `takeaway-${index}-line-${lineIndex}`,
                style: {
                  display: 'flex',
                  color: '#c4cbe0',
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: 1.2,
                },
              },
              line,
            ),
          ),
        )
      : null,
  );
}

function renderTakeawayRow(takeaways: string[], rowIndex: number) {
  return createElement(
    'div',
    {
      key: `takeaway-row-${rowIndex}`,
      style: {
        display: 'flex',
        gap: 13,
        width: '100%',
      },
    },
    ...takeaways.map((takeaway, index) => renderTakeaway(takeaway, rowIndex * 2 + index)),
  );
}

function renderProgressStep(number: string, label: string, color: string) {
  return createElement(
    'div',
    {
      key: number,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      },
    },
    createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 29,
          height: 29,
          borderRadius: 15,
          border: `2px solid ${color}`,
          color,
          fontSize: 14,
          fontWeight: 800,
        },
      },
      number,
    ),
    createElement(
      'div',
      {
        style: {
          display: 'flex',
          color: BRAND_PALETTE.softWhite,
          fontSize: 16,
          fontWeight: 700,
        },
      },
      label,
    ),
  );
}

export async function generateBrandedDailyImage({
  dayNumber,
  topic,
  takeaways,
}: DailyImageOptions): Promise<Buffer> {
  const rows = [];
  for (let index = 0; index < Math.min(takeaways.length, 6); index += 2) {
    rows.push(renderTakeawayRow(takeaways.slice(index, index + 2), index / 2));
  }

  const image = new ImageResponse(
    createElement(
      'div',
      {
        style: {
          display: 'flex',
          width: '100%',
          height: '100%',
          padding: 46,
          color: BRAND_PALETTE.white,
          backgroundColor: BRAND_PALETTE.background,
          backgroundImage: 'linear-gradient(140deg, #050711 0%, #0a0d20 48%, #160d2b 100%)',
          fontFamily: 'Arial',
          position: 'relative',
          overflow: 'hidden',
        },
      },
      createElement('div', {
        style: {
          display: 'flex',
          position: 'absolute',
          top: -210,
          right: -120,
          width: 520,
          height: 520,
          borderRadius: 260,
          border: '2px solid #402776',
          opacity: 0.45,
        },
      }),
      createElement('div', {
        style: {
          display: 'flex',
          position: 'absolute',
          top: -140,
          right: -50,
          width: 360,
          height: 360,
          borderRadius: 180,
          border: '2px solid #155570',
          opacity: 0.38,
        },
      }),
      createElement(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            position: 'relative',
          },
        },
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 19,
            },
          },
          createElement(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            },
            createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: BRAND_PALETTE.cyanBright,
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: 3,
                },
              },
              createElement('div', {
                style: {
                  display: 'flex',
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #f044ff, #20d9ff)',
                },
              }),
              'SEO GROWTH SERIES',
            ),
            createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 17px',
                  borderRadius: 18,
                  border: '1px solid #7439d4',
                  background: 'linear-gradient(100deg, #411679, #152550)',
                  color: BRAND_PALETTE.white,
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: 2,
                },
              },
              `DAY ${String(dayNumber).padStart(3, '0')}`,
            ),
          ),
          createElement(
            'div',
            {
              style: {
                display: 'flex',
                gap: 18,
                alignItems: 'stretch',
              },
            },
            createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  flex: 1,
                  minWidth: 0,
                },
              },
              createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    color: BRAND_PALETTE.magenta,
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: 3,
                  },
                },
                'THE PRACTICAL SEO FIELD GUIDE',
              ),
              createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    marginTop: 10,
                    maxWidth: 760,
                    color: BRAND_PALETTE.white,
                    fontSize: 50,
                    fontWeight: 900,
                    lineHeight: 1.04,
                    letterSpacing: -1,
                  },
                },
                topic.slice(0, 130),
              ),
              createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    marginTop: 15,
                    width: 155,
                    height: 6,
                    borderRadius: 5,
                    background: 'linear-gradient(90deg, #ea3cff, #9b4dff, #22d3ee)',
                  },
                },
              ),
            ),
            createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 178,
                  padding: 15,
                  borderRadius: 24,
                  border: '1px solid #462d79',
                  background: 'linear-gradient(145deg, #17132f, #0d1428)',
                },
              },
              createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    color: '#b7bdd2',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 2,
                  },
                },
                '365-DAY JOURNEY',
              ),
              createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    marginTop: 5,
                    color: BRAND_PALETTE.magenta,
                    fontSize: 58,
                    fontWeight: 900,
                    lineHeight: 1,
                  },
                },
                String(dayNumber).padStart(2, '0'),
              ),
              createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    marginTop: 8,
                    color: BRAND_PALETTE.cyanBright,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: 1,
                  },
                },
                'LEARN • APPLY • GROW',
              ),
            ),
          ),
          createElement(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginTop: 2,
              },
            },
            createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  color: BRAND_PALETTE.white,
                  fontSize: 17,
                  fontWeight: 900,
                  letterSpacing: 2,
                },
              },
              'KEY AREAS TO KNOW',
            ),
            createElement('div', {
              style: {
                display: 'flex',
                flex: 1,
                height: 1,
                background: 'linear-gradient(90deg, #b83fff, #245b82, transparent)',
              },
            }),
            createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  color: '#9da8c7',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 2,
                },
              },
              '6 QUICK CHECKS',
            ),
          ),
          ...rows,
        ),
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            },
          },
          createElement(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 18px',
                borderRadius: 17,
                border: '1px solid #342758',
                background: 'linear-gradient(90deg, #17122e, #10182b)',
              },
            },
            createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                },
              },
              createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    background: 'linear-gradient(135deg, #fa45c5, #733cff)',
                    color: BRAND_PALETTE.white,
                    fontSize: 17,
                    fontWeight: 900,
                  },
                },
                '!',
              ),
              createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  },
                },
                createElement(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      color: BRAND_PALETTE.magenta,
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: 2,
                    },
                  },
                  'REMEMBER',
                ),
                createElement(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      color: BRAND_PALETTE.softWhite,
                      fontSize: 17,
                      fontWeight: 700,
                    },
                  },
                  'A useful SEO change starts with evidence—not assumptions.',
                ),
              ),
            ),
            createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  gap: 17,
                },
              },
              renderProgressStep('1', 'CHECK', BRAND_PALETTE.magenta),
              renderProgressStep('2', 'IMPROVE', BRAND_PALETTE.cyanBright),
              renderProgressStep('3', 'MEASURE', BRAND_PALETTE.purple),
            ),
          ),
          createElement(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 9,
                borderTop: '1px solid #292b48',
                color: '#aeb6ce',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
              },
            },
            createElement('div', { style: { display: 'flex', color: BRAND_PALETTE.white } }, 'POSTFLOW  /  SEO LEARNING JOURNEY'),
            createElement('div', { style: { display: 'flex', color: BRAND_PALETTE.cyanBright } }, '365 DAYS  •  DAILY PROGRESS'),
          ),
        ),
      ),
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
