import React from 'react'

type IconName =
  | 'bell'
  | 'search'
  | 'play'
  | 'file'
  | 'bookmark'
  | 'chart'
  | 'clock'
  | 'user'
  | 'chevron'
  | 'grid'
  | 'target'
  | 'eye'
  | 'accessibility'
  | 'external'

const colors = [
  ['500', '#F97316'],
  ['400', '#F9230C'],
  ['300', '#FDBA74'],
  ['200', '#FED7AA'],
  ['100', '#FFF1E5'],
]
const neutrals = [
  ['900', '#0F172A'],
  ['700', '#334155'],
  ['500', '#64748B'],
  ['300', '#CBD5E1'],
  ['200', '#E2E8F0'],
  ['100', '#F1F5F9'],
  ['50', '#FAFAFC'],
  ['White', '#FFFFFF'],
]
const iconNames: IconName[] = [
  'bell',
  'search',
  'play',
  'file',
  'bookmark',
  'chart',
  'clock',
  'user',
  'chevron',
]

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  const paths: Record<IconName, React.ReactNode> = {
    bell: (
      <>
        <path d='M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9' />
        <path d='M10 21h4' />
      </>
    ),
    search: (
      <>
        <circle
          cx='11'
          cy='11'
          r='6.5'
        />
        <path d='m16 16 4 4' />
      </>
    ),
    play: (
      <>
        <circle
          cx='12'
          cy='12'
          r='9'
        />
        <path d='m10 8 5 4-5 4z' />
      </>
    ),
    file: (
      <>
        <path d='M6 3h8l4 4v14H6z' />
        <path d='M14 3v5h4M9 13h6M9 17h6' />
      </>
    ),
    bookmark: (
      <path d='M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21z' />
    ),
    chart: (
      <>
        <path d='M5 20V12M12 20V7M19 20V4' />
        <path d='M3 20h18' />
      </>
    ),
    clock: (
      <>
        <circle
          cx='12'
          cy='12'
          r='9'
        />
        <path d='M12 7v5l3 2' />
      </>
    ),
    user: (
      <>
        <circle
          cx='12'
          cy='8'
          r='3.5'
        />
        <path d='M5 21c.7-3.5 3-5.5 7-5.5s6.3 2 7 5.5' />
      </>
    ),
    chevron: <path d='m9 5 7 7-7 7' />,
    grid: (
      <>
        <rect
          x='4'
          y='4'
          width='6'
          height='6'
          rx='1'
        />
        <rect
          x='14'
          y='4'
          width='6'
          height='6'
          rx='1'
        />
        <rect
          x='4'
          y='14'
          width='6'
          height='6'
          rx='1'
        />
        <rect
          x='14'
          y='14'
          width='6'
          height='6'
          rx='1'
        />
      </>
    ),
    target: (
      <>
        <circle
          cx='12'
          cy='12'
          r='8'
        />
        <circle
          cx='12'
          cy='12'
          r='4'
        />
        <path d='m16 8 4-4M17 4h3v3' />
      </>
    ),
    eye: (
      <>
        <path d='M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12' />
        <circle
          cx='12'
          cy='12'
          r='2.5'
        />
      </>
    ),
    accessibility: (
      <>
        <circle
          cx='12'
          cy='4'
          r='1.5'
        />
        <path d='M5 8h14M12 8v12M8 20l4-6 4 6' />
      </>
    ),
    external: (
      <>
        <path d='M14 4h6v6M20 4l-9 9' />
        <path d='M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6' />
      </>
    ),
  }
  return <svg {...common}>{paths[name]}</svg>
}

function VertexMark() {

  return (
    <span
      className='vertex-mark'
      aria-hidden='true'
    >
      <svg
        viewBox='0 0 32 28'
        fill='none'
      >
        <path
          d='M2 2h28L16 27 2 2Z'
          fill='currentColor'
        />
        <path
          d='m10 7 6 11 6-11h-5l-1 3-1-3h-5Z'
          fill='white'
        />
      </svg>
    </span>
  )
}
function SectionHeading({
  number,
  children,
}: {
  number: string
  children: React.ReactNode
}) {
  return (
    <div className='section-heading'>
      <span>{number}</span>
      <h2>{children}</h2>
    </div>
  )
}

function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={`panel ${className}`}>{children}</section>
}

function Swatch({ label, value }: { label: string; value: string }) {
  return (
    <div className='swatch-wrap'>
      <div
        className='swatch'
        style={{ backgroundColor: value }}
      />
      <span>{label}</span>
      <code>{value}</code>
    </div>
  )
}

function Tag({
  children,
  tone = 'orange',
}: {
  children: React.ReactNode
  tone?: 'orange' | 'purple'
}) {
  return <span className={`tag tag-${tone}`}>{children}</span>
}

export default function Home() {
  return (
    <main className='design-system'>
      <div className='top-grid'>
        <Panel className='intro-panel'>
          <div className='brand'>
            <VertexMark />
            <span>Vertex</span>
          </div>
          <h1>Design System</h1>
          <p>
            A unified design language for Vertex learning platform. Clean,
            modern and focused on clarity, consistency and intuitive learning
            experiences.
          </p>
          <div className='version'>
            VERSION 1.0 <i /> MAY 2025
          </div>
        </Panel>
        <Panel className='colors-panel'>
          <SectionHeading number='01'>Colors</SectionHeading>
          <h3>Primary</h3>
          <div className='swatches primary-swatches'>
            {colors.map(([label, value]) => (
              <Swatch
                key={label}
                label={`Primary ${label}`}
                value={value}
              />
            ))}
          </div>
          <h3>Neutral</h3>
          <div className='swatches neutral-swatches'>
            {neutrals.map(([label, value]) => (
              <Swatch
                key={label}
                label={`Neutral ${label}`}
                value={value}
              />
            ))}
          </div>
        </Panel>
      </div>
      <div className='two-col'>
        <Panel>
          <SectionHeading number='02'>Typography</SectionHeading>
          <div className='font-samples'>
            <div className='font-sample serif'>Ag</div>
            <div>
              <strong>Playfair Display</strong>
              <p>
                Elegant <b /> Readable <b /> Timeless
              </p>
            </div>
            <div className='font-sample sans'>Ag</div>
            <div>
              <strong>Inter</strong>
              <p>
                Clean <b /> Modern <b /> Highly legible
              </p>
            </div>
          </div>
        </Panel>
        <Panel>
          <SectionHeading number='03'>Type Scale</SectionHeading>
          <div className='type-table'>
            <div className='table-head'>
              <span>Style</span>
              <span>Font</span>
              <span>Size / Line Height</span>
              <span>Weight</span>
              <span>Use</span>
            </div>
            {[
              [
                'Display 1',
                'Playfair Display',
                '48 / 56',
                'Bold',
                'Page titles',
              ],
              [
                'Display 2',
                'Playfair Display',
                '36 / 44',
                'Bold',
                'Section titles',
              ],
              ['Heading 1', 'Inter', '28 / 36', 'Semi Bold', 'Card titles'],
              ['Heading 2', 'Inter', '22 / 30', 'Semi Bold', 'Sub section'],
              ['Heading 3', 'Inter', '18 / 26', 'Medium', 'Small titles'],
              ['Body Large', 'Inter', '16 / 24', 'Regular', 'Body copy'],
              ['Body', 'Inter', '14 / 20', 'Regular', 'Supporting text'],
              ['Small', 'Inter', '12 / 16', 'Regular', 'Captions, meta'],
            ].map(row => (
              <div
                className='table-row'
                key={row[0]}
              >
                {row.map(cell => (
                  <span key={cell}>{cell}</span>
                ))}
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className='two-col spacing-row'>
        <Panel>
          <SectionHeading number='04'>Spacing System</SectionHeading>
          <p className='subline'>Base unit: 4px</p>
          <div className='spacing-scale'>
            {[
              [4, '0.25rem'],
              [8, '0.5rem'],
              [12, '0.75rem'],
              [16, '1rem'],
              [24, '1.5rem'],
              [32, '2rem'],
              [40, '2.5rem'],
              [48, '3rem'],
              [64, '4rem'],
            ].map(([n, rem]) => (
              <div
                key={n}
                className='space-item'
              >
                <div
                  className='space-bar'
                  style={{ height: `${Number(n) / 2 + 3}px` }}
                />
                <strong>{n}</strong>
                <span>({rem})</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <SectionHeading number='05'>Radius &amp; Shadows</SectionHeading>
          <h3>Radius</h3>
          <div className='radius-row'>
            {[
              ['4px', 'xs'],
              ['8px', 'sm'],
              ['12px', 'md'],
              ['16px', 'lg'],
              ['24px', 'xl'],
              ['Full', 'circle'],
            ].map(([label, key]) => (
              <div key={key}>
                <div className={`radius radius-${key}`} />
                <span>{label}</span>
                <small>({key})</small>
              </div>
            ))}
          </div>
          <h3>Shadows</h3>
          <div className='shadow-row'>
            {[
              ['Sm', '0 1px 2px 0 rgba(15, 23, 42, .06)'],
              ['Md', '0 4px 12px -2px rgba(15, 23, 42, .08)'],
              ['Lg', '0 12px 24px -4px rgba(15, 23, 42, .1)'],
              ['Xl', '0 20px 40px -8px rgba(15, 23, 42, .12)'],
            ].map(([key, value]) => (
              <div
                className='shadow-card'
                key={key}
              >
                <b>{key}</b>
                <small>{value}</small>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className='three-col'>
        <Panel>
          <SectionHeading number='06'>Icons</SectionHeading>
          <h3>Outline Style</h3>
          <div className='icon-row'>
            {iconNames.map(name => (
              <Icon
                key={name}
                name={name}
              />
            ))}
          </div>
          <h3>Filled Style</h3>
          <div className='icon-row filled'>
            {iconNames.map(name => (
              <Icon
                key={name}
                name={name}
              />
            ))}
          </div>
          <div className='spec-list'>
            <b>Icon Specs</b>
            <span>• 24x24px grid</span>
            <span>• 2px stroke width (outline)</span>
            <span>• Rounded line caps</span>
            <span>• Consistent optical balance</span>
          </div>
        </Panel>
        <Panel className='buttons-panel'>
          <SectionHeading number='07'>Buttons</SectionHeading>
          <div className='button-table'>
            <div />
            <span>Primary</span>
            <span>Secondary</span>
            <span>Tertiary</span>
            <span>Text</span>
            {['Default', 'Hover', 'Disabled'].map(state => (
              <React.Fragment key={state}>
                <span>{state}</span>
                <button
                  className={`btn primary ${state === 'Disabled' ? 'disabled' : ''}`}
                >
                  Get Started
                </button>
                <button
                  className={`btn secondary ${state === 'Disabled' ? 'disabled' : ''}`}
                >
                  Explore Courses
                </button>
                <button
                  className={`btn tertiary ${state === 'Disabled' ? 'disabled' : ''}`}
                >
                  View Lesson{' '}
                  <Icon
                    name='external'
                    size={12}
                  />
                </button>
                <button
                  className={`btn text ${state === 'Disabled' ? 'disabled' : ''}`}
                >
                  Watch Video{' '}
                  <Icon
                    name='play'
                    size={13}
                  />
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className='spec-list'>
            <b>Button Specs</b>
            <span>• Height: 44px (default)</span>
            <span>• Padding: 0 16px (lg), 0 12px (md)</span>
            <span>• Radius: 12px</span>
            <span>• Font: Inter Medium (14–16px)</span>
          </div>
        </Panel>
        <Panel>
          <SectionHeading number='08'>Inputs</SectionHeading>
          <label
            className='input-label'
            htmlFor='search'
          >
            Search / Text Input
          </label>
          <div className='search-input'>
            <Icon name='search' />
            <input
              id='search'
              placeholder='Search anything...'
            />
            <kbd>⌘ K</kbd>
          </div>
          <label
            className='input-label'
            htmlFor='sort'
          >
            Select
          </label>
          <select
            id='sort'
            defaultValue='relevant'
          >
            <option value='relevant'>Most Relevant</option>
            <option value='recent'>Most Recent</option>
          </select>
          <div className='spec-list'>
            <b>Field Specs</b>
            <span>• Height: 44px</span>
            <span>• Radius: 12px</span>
            <span>• Border: 1px solid #E2E8F0</span>
            <span>• Padding: 0 16px</span>
            <span>• Focus: Border color #F9230C</span>
          </div>
        </Panel>
      </div>
      <div className='three-col compact-row'>
        <Panel>
          <SectionHeading number='09'>Badges / Tags</SectionHeading>
          <div className='badge-examples'>
            <span>
              Video<Tag>VIDEO</Tag>
            </span>
            <span>
              Lesson<Tag tone='purple'>LESSON</Tag>
            </span>
            <span>
              Popular<Tag>POPULAR</Tag>
            </span>
          </div>
        </Panel>
        <Panel>
          <SectionHeading number='10'>Status / Indicators</SectionHeading>
          <div className='status-row'>
            <span className='progress-status'>
              ◯ <em>In Progress</em>
            </span>
            <span className='complete-status'>
              ✓ <em>Completed</em>
            </span>
            <span className='playing-status'>
              <Icon
                name='play'
                size={16}
              />{' '}
              <em>Now Playing</em>
            </span>
            <span>
              ♙ <em>Locked</em>
            </span>
          </div>
        </Panel>
        <Panel>
          <SectionHeading number='11'>Progress Bar</SectionHeading>
          <div className='progress-row'>
            <div className='progress-track'>
              <span />
            </div>
            <b>
              35% <small>complete</small>
            </b>
          </div>
        </Panel>
      </div>
      <Panel className='cards-panel'>
        <SectionHeading number='12'>Cards</SectionHeading>
        <div className='cards-grid'>
          <div>
            <label>Course Card</label>
            <article className='course-card'>
              <div className='course-logo'>N</div>
              <div>
                <h3>Next.js for Production</h3>
                <p>
                  Build scalable, high-performance web applications with
                  Next.js.
                </p>
              </div>
              <footer>
                <span>
                  <Icon
                    name='chart'
                    size={12}
                  />{' '}
                  Intermediate
                </span>
                <span>
                  <Icon
                    name='clock'
                    size={12}
                  />{' '}
                  18h 24m
                </span>
                <span>▱ 12 modules</span>
              </footer>
            </article>
          </div>
          <div>
            <label>Lesson Card (Video)</label>
            <article className='lesson-card'>
              <Tag>VIDEO</Tag>
              <h3>Data Fetching in Server Components</h3>
              <p>
                Learn how to fetch data on the server using async/await and
                Next.js best practices.
              </p>
              <footer>
                Lesson 5.1 · 12:45 <a href='#watch'>◉ Watch from 12:45</a>
              </footer>
            </article>
          </div>
          <div>
            <label>Lesson Card (Lesson)</label>
            <article className='lesson-card'>
              <Tag tone='purple'>LESSON</Tag>
              <h3>Data Fetching &amp; Caching</h3>
              <p>
                Explore different data fetching methods in Next.js and how to
                cache and revalidate data for optimal performance.
              </p>
              <footer>
                Module 5 <a href='#lesson'>View lesson ↗</a>
              </footer>
            </article>
          </div>
          <div>
            <label>Resource Card</label>
            <article className='resource-card'>
              <Icon
                name='file'
                size={24}
              />
              <div>
                <h3>Caching and Revalidation Guide</h3>
                <p>Deep dive into Next.js caching strategies.</p>
                <footer>
                  PDF　·　1.2 MB{' '}
                  <a href='#resource'>
                    <Icon
                      name='external'
                      size={14}
                    />
                  </a>
                </footer>
              </div>
            </article>
          </div>
        </div>
      </Panel>
      <Panel className='navigation-panel'>
        <SectionHeading number='13'>Navigation</SectionHeading>
        <div className='nav-demo'>
          <div className='nav-brand'>
            <VertexMark />
            <b>Vertex</b>
          </div>
          <nav>
            <a
              className='active'
              href='#courses'
            >
              Courses
            </a>
            <a href='#learning'>My Learning</a>
          </nav>
          <div className='crumbs'>
            <span>Breadcrumbs</span>
            <p>
              All Courses　›　 Next.js for Production　›　 Data Fetching &amp;
              Caching
            </p>
          </div>
          <div className='pagination'>
            <span>Pagination</span>
            <p>
              ‹　 <b>1</b>　 2　 3　 …　 8　 ›
            </p>
          </div>
        </div>
      </Panel>
      <Panel className='principles-panel'>
        <SectionHeading number='14'>Principles</SectionHeading>
        <div className='principles'>
          <div>
            <Icon
              name='eye'
              size={30}
            />
            <span>
              <b>Clarity First</b>
              <small>Every element should communicate clearly.</small>
            </span>
          </div>
          <div>
            <Icon
              name='grid'
              size={30}
            />
            <span>
              <b>Consistency</b>
              <small>
                Use components and patterns consistently across the platform.
              </small>
            </span>
          </div>
          <div>
            <Icon
              name='target'
              size={30}
            />
            <span>
              <b>Focus &amp; Calm</b>
              <small>
                Remove noise and help learners focus on what matters.
              </small>
            </span>
          </div>
          <div>
            <Icon
              name='accessibility'
              size={30}
            />
            <span>
              <b>Accessible</b>
              <small>Design with accessibility and inclusivity in mind.</small>
            </span>
          </div>
        </div>
      </Panel>
    </main>
  )
}
