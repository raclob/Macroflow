import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { App as NativeApp } from '@capacitor/app';
import {
  LayoutDashboard,
  Utensils,
  ChartNoAxesCombined,
  SlidersHorizontal,
  Plus,
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Search,
  ScanBarcode,
  Star,
  Droplets,
  TrendingDown,
  Scale,
  Flame,
  Leaf,
  Settings,
  Download,
  Upload,
  Trash2,
  Sparkles,
  CircleHelp,
  CheckCheck,
  Coffee,
  Sun,
  Moon,
  Apple,
  Minus,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import {
  type AppData,
  type Food,
  type Entry,
  type Profile,
  catalog,
  dateKey,
  shiftDate,
  emptyDay,
  totals,
  carbTarget,
  newData,
  demoData,
  weightSeries,
  adaptive,
  validateData,
  meals,
} from './model';
import './styles.css';

type Page = 'Today' | 'Food diary' | 'Insights' | 'My plan';
type ModalType = 'food' | 'weight' | 'settings' | 'setup' | 'checkin' | null;
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const shortDate = (key: string) =>
  new Date(key + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
function readStorage(): { data: AppData; demo: boolean } {
  try {
    const d = JSON.parse(
      (localStorage.getItem('macroflow-data') ?? localStorage.getItem('fuel-data')) || 'null',
    );
    return {
      data: validateData(d) ? d : newData(),
      demo:
        (localStorage.getItem('macroflow-demo') ?? localStorage.getItem('fuel-demo')) !== 'false',
    };
  } catch {
    return { data: newData(), demo: true };
  }
}
function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Leaf size={23} strokeWidth={2.4} />
      </span>
      <span>
        macro<span className="brand-flow">flow</span>
      </span>
    </div>
  );
}
function App() {
  const initial = useRef(readStorage());
  const [userData, setUserData] = useState(initial.current.data);
  const [sample, setSample] = useState(demoData);
  const [demo, setDemo] = useState(initial.current.demo);
  const data = demo ? sample : userData;
  const [page, setPage] = useState<Page>('Today');
  const [selectedDate, setSelectedDate] = useState(dateKey());
  const [modal, setModal] = useState<ModalType>(null);
  const [meal, setMeal] = useState('Breakfast');
  const [toast, setToast] = useState('');
  const [range, setRange] = useState(28);
  const [formError, setFormError] = useState('');
  const today = dateKey(),
    day = data.days[selectedDate] || emptyDay(),
    sum = totals(day.entries),
    profile = data.profile,
    remaining = profile.calories - sum.calories;
  const targets = {
    calories: profile.calories,
    protein: profile.protein,
    carbs: carbTarget(profile),
    fat: profile.fat,
  };
  const analysis = adaptive(data);
  const series = weightSeries(data, today, range);
  const latest = series.at(-1);
  const locked = !!profile.lastCheckIn && profile.lastCheckIn > shiftDate(today, -7);
  const hasUserData = JSON.stringify(userData) !== JSON.stringify(newData());
  useEffect(() => {
    try {
      localStorage.setItem('macroflow-data', JSON.stringify(userData));
      localStorage.setItem('macroflow-demo', String(demo));
    } catch {
      setToast('Storage is full. Export a backup to keep your logs.');
    }
  }, [userData, demo]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(''), 3500);
      return () => clearTimeout(id);
    }
  }, [toast]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listener = NativeApp.addListener('backButton', () => {
      if (modal) setModal(null);
      else if (page !== 'Today') setPage('Today');
      else NativeApp.exitApp();
    });
    return () => {
      listener.then((h) => h.remove());
    };
  }, [modal, page]);
  function update(fn: (d: AppData) => AppData) {
    (demo ? setSample : setUserData)(fn);
  }
  function updateDay(fn: (d: ReturnType<typeof emptyDay>) => ReturnType<typeof emptyDay>) {
    update((d) => ({
      ...d,
      days: { ...d.days, [selectedDate]: fn(d.days[selectedDate] || emptyDay()) },
    }));
  }
  function open(m: ModalType) {
    setFormError('');
    setModal(m);
  }
  function leaveDemo() {
    if (hasUserData) {
      setDemo(false);
      setModal(null);
      setToast('Welcome back to your diary');
    } else open('setup');
  }
  function openFood(m?: string) {
    setMeal(m || 'Breakfast');
    open('food');
  }
  async function exportData() {
    try {
      const content = JSON.stringify(data, null, 2),
        name = `macroflow-${demo ? 'demo-' : ''}${today}.json`;
      if (Capacitor.isNativePlatform()) {
        const f = await Filesystem.writeFile({
          path: name,
          data: content,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({ title: 'MacroFlow backup', url: f.uri });
      } else {
        const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
      }
      setToast('Backup ready. Keep it somewhere safe.');
    } catch {
      setToast('Could not export. Please try again.');
    }
  }
  function addFood(food: Food, quantity: number) {
    update((d) => ({
      ...d,
      days: {
        ...d.days,
        [selectedDate]: {
          ...(d.days[selectedDate] || emptyDay()),
          complete: false,
          entries: [
            ...(d.days[selectedDate]?.entries || []),
            { ...food, quantity, meal, entryId: crypto.randomUUID() },
          ],
        },
      },
      foods:
        catalog.some((f) => f.id === food.id) || d.foods.some((f) => f.id === food.id)
          ? d.foods
          : [...d.foods, food],
    }));
    setModal(null);
    setToast(`${food.name} added to ${meal.toLowerCase()}`);
  }
  function favorite(id: string) {
    update((d) => ({
      ...d,
      favorites: d.favorites.includes(id)
        ? d.favorites.filter((x) => x !== id)
        : [...d.favorites, id],
    }));
  }
  const navItems: { name: Page; icon: typeof Leaf }[] = [
    { name: 'Today', icon: LayoutDashboard },
    { name: 'Food diary', icon: Utensils },
    { name: 'Insights', icon: ChartNoAxesCombined },
    { name: 'My plan', icon: SlidersHorizontal },
  ];
  const dateControl = (
    <div className="date-control">
      <button
        className="icon-button"
        aria-label="Previous day"
        onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
      >
        <ChevronLeft size={18} />
      </button>
      <label className="date-label">
        {selectedDate === today ? 'Today' : shortDate(selectedDate)}
        <input
          aria-label="Choose diary date"
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
        />
      </label>
      <button
        className="icon-button"
        aria-label="Next day"
        disabled={selectedDate >= today}
        onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
  const macros = (
    <div className="macro-grid">
      {(['protein', 'carbs', 'fat'] as const).map((key, i) => (
        <div className={`macro macro-${key}`} key={key}>
          <div className="macro-title">
            <span className="dot" />
            {['Protein', 'Carbs', 'Fat'][i]}
            <span className="macro-percent">
              {Math.round((sum[key] / Math.max(1, targets[key])) * 100)}%
            </span>
          </div>
          <div className="macro-value">
            {fmt(sum[key])}
            <span> / {targets[key]} g</span>
          </div>
          <div className="progress">
            <div
              style={{ width: `${Math.min(100, (sum[key] / Math.max(1, targets[key])) * 100)}%` }}
            />
          </div>
          <span className="macro-left">
            {fmt(Math.abs(targets[key] - sum[key]))} g{' '}
            {sum[key] > targets[key] ? 'over target' : 'left'}
          </span>
        </div>
      ))}
    </div>
  );
  const foodDiary = (compact = false) => (
    <section className="card diary-card">
      <div className="section-heading">
        <div>
          <h2>Your food diary</h2>
          <p>A little of everything adds up.</p>
        </div>
        {compact ? (
          <button className="text-button" onClick={() => setPage('Food diary')}>
            View diary <ArrowUpRight size={16} />
          </button>
        ) : (
          <button className="text-button" onClick={() => openFood()}>
            Add food <Plus size={17} />
          </button>
        )}
      </div>
      <div className="meal-list">
        {meals.map((m, i) => {
          const entries = day.entries.filter((e) => e.meal === m),
            t = totals(entries);
          const MealIcon = [Coffee, Sun, Moon, Apple][i];
          return (
            <div className="meal-group" key={m}>
              <div className="meal-heading">
                <div className={`meal-icon meal-${i}`}>
                  <MealIcon size={19} />
                </div>
                <div className="meal-name">
                  <h3>{m}</h3>
                  <span>
                    {entries.length
                      ? `${entries.length} item${entries.length > 1 ? 's' : ''}`
                      : 'Make room for something good'}
                  </span>
                </div>
                <span className="meal-calories">
                  {fmt(t.calories)} <small>kcal</small>
                </span>
                <button
                  className="circle-button"
                  aria-label={`Add to ${m}`}
                  onClick={() => openFood(m)}
                >
                  <Plus size={17} />
                </button>
              </div>
              {!compact &&
                entries.map((e) => (
                  <div className="food-entry" key={e.entryId}>
                    <div>
                      <strong>{e.name}</strong>
                      <span>
                        {e.quantity} × {e.serving}
                      </span>
                      <small>
                        P {fmt(e.protein * e.quantity)} · C {fmt(e.carbs * e.quantity)} · F{' '}
                        {fmt(e.fat * e.quantity)}
                      </small>
                    </div>
                    <span>
                      {fmt(e.calories * e.quantity)} <small>kcal</small>
                    </span>
                    <button
                      className="icon-button delete"
                      aria-label={`Remove ${e.name}`}
                      onClick={() => {
                        updateDay((d) => ({
                          ...d,
                          complete: false,
                          entries: d.entries.filter((x) => x.entryId !== e.entryId),
                        }));
                        setToast('Food removed');
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
      {!compact && (
        <div className="diary-bottom">
          <div>
            <CheckCheck size={20} />
            <div>
              <strong>{day.complete ? 'Day marked complete' : 'Finished logging?'}</strong>
              <span>
                {day.complete
                  ? 'This day can inform your weekly check-in.'
                  : 'Complete days help MacroFlow learn your needs.'}
              </span>
            </div>
          </div>
          <button
            className={day.complete ? 'button secondary' : 'button primary'}
            disabled={!day.entries.length}
            onClick={() => updateDay((d) => ({ ...d, complete: !d.complete }))}
          >
            {day.complete ? 'Reopen day' : 'Complete day'}
          </button>
        </div>
      )}
    </section>
  );
  const waterCard = (
    <section className="card water-card">
      <div className="section-heading">
        <h2>Stay hydrated</h2>
        <span className="badge">DAILY HABIT</span>
      </div>
      <div className="water-main">
        <span className="water-icon">
          <Droplets size={27} />
        </span>
        <div>
          <strong>
            {(day.water / 1000).toFixed(2).replace(/0$/, '')} <small>/ 2.5 L</small>
          </strong>
          <p>A sip in the right direction.</p>
        </div>
      </div>
      <div className="water-drops">
        {Array.from({ length: 10 }, (_, i) => (
          <Droplets key={i} size={25} className={day.water >= 250 * (i + 1) ? 'filled' : ''} />
        ))}
      </div>
      <div className="water-actions">
        <button
          className="button secondary"
          disabled={day.water <= 0}
          onClick={() => updateDay((d) => ({ ...d, water: Math.max(0, d.water - 250) }))}
          aria-label="Remove 250 ml water"
        >
          <Minus size={16} />
        </button>
        <button
          className="button secondary"
          disabled={day.water >= 20000}
          onClick={() => updateDay((d) => ({ ...d, water: Math.min(20000, d.water + 250) }))}
        >
          <Plus size={16} /> Add 250 ml
        </button>
      </div>
    </section>
  );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-caption">YOUR DAILY COMPANION</div>
        <nav>
          {navItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${page === name ? 'active' : ''}`}
              onClick={() => setPage(name)}
            >
              <Icon size={21} />
              <span>{name}</span>
              {page === name && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-icon">
            <Sparkles size={20} />
          </span>
          <h3>
            Small steps.
            <br />
            Lasting progress.
          </h3>
          <p>
            Build a routine that feels
            <br />
            good for you.
          </p>
          <span className="note-decoration">
            <Leaf size={74} strokeWidth={0.9} />
          </span>
        </div>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => open('settings')}>
            <Settings size={20} />
            <span>Settings & data</span>
          </button>
          <div className="profile">
            <span className="avatar">{profile.name.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{profile.name}</strong>
              <span>Your nutrition, your pace</span>
            </div>
            <button
              className="icon-button"
              aria-label="Edit profile"
              onClick={() => open('settings')}
            >
              <SlidersHorizontal size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="mobile-brand">
            <Brand />
          </div>
          <div className="breadcrumb">
            Your space <ChevronRight size={14} /> <span>{page}</span>
          </div>
          <div className="topbar-right">
            <span className="local-label">
              <ShieldCheck size={15} /> Stored on your device
            </span>
            <button
              className="icon-button"
              aria-label="About weekly check-ins"
              onClick={() => {
                setPage('My plan');
                setToast('Your check-in is ready once you have enough completed logs.');
              }}
            >
              <Bell size={20} />
              <span className="notification-dot" />
            </button>
            <button
              className="avatar avatar-small"
              aria-label="Open settings"
              onClick={() => open('settings')}
            >
              {profile.name.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <h1>
                {page === 'Today'
                  ? `A good day starts here${profile.name ? `, ${profile.name}` : ''}.`
                  : page === 'Food diary'
                    ? 'A little more mindful.'
                    : page === 'Insights'
                      ? 'See the bigger picture.'
                      : 'A plan that grows with you.'}
              </h1>
              <p>
                {page === 'Today'
                  ? 'Nourish your day. Find your balance.'
                  : page === 'Food diary'
                    ? 'Your daily nutrition, one meal at a time.'
                    : page === 'Insights'
                      ? 'Real progress is a trend, not a single number.'
                      : 'Your goals, guided by your own data.'}
              </p>
            </div>
            <div className="heading-action">
              {page === 'Today' || page === 'Food diary' ? (
                dateControl
              ) : page === 'Insights' ? (
                <button className="button secondary" onClick={() => open('weight')}>
                  <Plus size={17} /> Log weight
                </button>
              ) : (
                <span className="plan-pill">
                  <Sparkles size={15} /> Adaptive nutrition
                </span>
              )}
            </div>
          </div>
          {demo && (
            <div className="demo-banner">
              <div>
                <Sparkles size={17} />
                <span>
                  <strong>A little preview of what’s possible.</strong> You’re exploring sample
                  data.
                </span>
              </div>
              <button onClick={leaveDemo}>
                {hasUserData ? 'Back to my diary' : 'Make it yours'} <ArrowRight size={16} />
              </button>
            </div>
          )}
          {page === 'Today' && (
            <>
              <div className="dashboard-grid">
                <div className="main-column">
                  <section className="card nutrition-card">
                    <div className="section-heading">
                      <div>
                        <span className="eyebrow">YOUR DAILY NUTRITION</span>
                        <h2>A little closer to your goals.</h2>
                      </div>
                      <span className="round-icon">
                        <Flame size={20} />
                      </span>
                    </div>
                    <div className="nutrition-main">
                      <div className="calorie-ring">
                        <svg viewBox="0 0 200 200">
                          <circle cx="100" cy="100" r="83" className="ring-track" />
                          <circle
                            cx="100"
                            cy="100"
                            r="83"
                            className="ring-fill"
                            strokeDasharray={`${Math.min(1, sum.calories / profile.calories) * 521.5} 521.5`}
                          />
                        </svg>
                        <div className="ring-label">
                          <span>{remaining >= 0 ? 'REMAINING' : 'OVER TARGET'}</span>
                          <strong>{fmt(Math.abs(remaining))}</strong>
                          <small>kcal</small>
                        </div>
                        <span className="ring-leaf">
                          <Leaf size={18} />
                        </span>
                      </div>
                      <div className="nutrition-detail">
                        <div className="nutrition-number">
                          <span>
                            <span className="tiny-dot teal" /> Eaten
                          </span>
                          <strong>
                            {fmt(sum.calories)}
                            <small>kcal</small>
                          </strong>
                        </div>
                        <div className="nutrition-number">
                          <span>
                            <span className="tiny-dot gray" /> Daily target
                          </span>
                          <strong>
                            {fmt(profile.calories)}
                            <small>kcal</small>
                          </strong>
                        </div>
                        <button className="button primary log-button" onClick={() => openFood()}>
                          <Plus size={18} /> Log food
                        </button>
                      </div>
                    </div>
                    {macros}
                    <div className="gentle-note">
                      <Leaf size={14} /> Progress over perfection. Every meal is a fresh start.
                    </div>
                  </section>
                  {foodDiary(true)}
                </div>
                <div className="right-column">
                  <section className="focus-card">
                    <div className="focus-top">
                      <span>
                        <Sparkles size={16} /> THE WEEKLY PICTURE
                      </span>
                      <ArrowUpRight size={20} />
                    </div>
                    <h2>
                      Your plan.
                      <br />A little smarter
                      <br />
                      every week.
                    </h2>
                    <p>
                      {analysis.ready
                        ? 'Your logs are helping us understand your energy needs. Ready for your next check-in?'
                        : 'Keep logging food and weight. Your plan will learn from your real-life routine.'}
                    </p>
                    <button
                      onClick={() => {
                        setPage('My plan');
                      }}
                    >
                      Meet your plan <ArrowRight size={17} />
                    </button>
                    <div className="focus-decoration">
                      <Leaf size={115} strokeWidth={0.7} />
                    </div>
                  </section>
                  <section className="card weight-card">
                    <div className="section-heading">
                      <h2>Weight trend</h2>
                      <span className="round-icon">
                        <Scale size={19} />
                      </span>
                    </div>
                    <div className="weight-value">
                      {latest ? latest.trend.toFixed(1) : '—'} <small>kg</small>
                      {latest && series.length > 1 && (
                        <span className="trend-badge">
                          <TrendingDown size={13} />
                          {(latest.trend - series[0].trend).toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="muted">
                      {latest
                        ? 'A smoother view of your progress'
                        : 'Log your first weight to begin'}
                    </p>
                    <TrendChart points={series} small />
                    <button className="text-button full-width" onClick={() => open('weight')}>
                      <Plus size={16} /> Log weight
                    </button>
                  </section>
                  {waterCard}
                </div>
              </div>
              <section className="consistency card">
                <div className="consistency-copy">
                  <span className="consistency-icon">
                    <CheckCheck size={24} />
                  </span>
                  <div>
                    <h2>Show up for yourself.</h2>
                    <p>Consistency is built one day at a time.</p>
                  </div>
                </div>
                <div className="week-days">
                  {Array.from({ length: 7 }, (_, i) => {
                    const key = shiftDate(today, i - 6),
                      done = data.days[key]?.complete;
                    return (
                      <button
                        key={key}
                        className={key === selectedDate ? 'selected' : ''}
                        onClick={() => setSelectedDate(key)}
                      >
                        <span>
                          {new Date(key + 'T12:00:00')
                            .toLocaleDateString('en-US', { weekday: 'short' })
                            .slice(0, 1)}
                        </span>
                        <div className={done ? 'day-dot done' : 'day-dot'}>
                          {done ? <Check size={17} /> : new Date(key + 'T12:00:00').getDate()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}
          {page === 'Food diary' && (
            <div className="diary-layout">
              <div>
                <section className="card diary-summary">
                  <div>
                    <span className="eyebrow">{day.complete ? 'DAY COMPLETE' : 'DAILY TOTAL'}</span>
                    <h2>
                      {fmt(sum.calories)} <small>/ {fmt(profile.calories)} kcal</small>
                    </h2>
                  </div>
                  <button className="button primary" onClick={() => openFood()}>
                    <Plus size={18} /> Log food
                  </button>
                  {macros}
                </section>
                {foodDiary()}
              </div>
              <div className="right-column">
                {waterCard}
                <section className="card tip-card">
                  <Leaf size={23} />
                  <h2>Make logging feel easy.</h2>
                  <p>
                    Save your regular foods with the star, then find them in Favorites next time.
                  </p>
                  <button className="text-button" onClick={() => openFood()}>
                    Find a food <ArrowRight size={16} />
                  </button>
                </section>
              </div>
            </div>
          )}
          {page === 'Insights' && (
            <>
              <div className="insight-stats">
                {[
                  {
                    label: 'Trend weight',
                    value: latest ? latest.trend.toFixed(1) : '—',
                    unit: 'kg',
                    note: 'Smoothed from your weigh-ins',
                    icon: Scale,
                  },
                  {
                    label: 'Weight change',
                    value:
                      latest && series.length > 1
                        ? (latest.trend - series[0].trend > 0 ? '+' : '') +
                          (latest.trend - series[0].trend).toFixed(1)
                        : '—',
                    unit: 'kg',
                    note: `Over the last ${range} days`,
                    icon: TrendingDown,
                  },
                  {
                    label: 'Estimated expenditure',
                    value: analysis.ready ? fmt(analysis.expenditure) : '—',
                    unit: 'kcal / day',
                    note: analysis.ready ? analysis.confidence : 'Needs more completed logs',
                    icon: Flame,
                  },
                ].map((s) => (
                  <section className="card stat-card" key={s.label}>
                    <span className="stat-icon">
                      <s.icon size={21} />
                    </span>
                    <span className="eyebrow">{s.label}</span>
                    <strong>
                      {s.value} <small>{s.unit}</small>
                    </strong>
                    <p>{s.note}</p>
                  </section>
                ))}
              </div>
              <section className="card chart-card">
                <div className="section-heading">
                  <div>
                    <h2>Less noise. More perspective.</h2>
                    <p>Your weight trend smooths out the daily ups and downs.</p>
                  </div>
                  <div className="segmented">
                    {[7, 28, 90].map((n) => (
                      <button
                        key={n}
                        className={range === n ? 'active' : ''}
                        onClick={() => setRange(n)}
                      >
                        {n === 7 ? '1W' : n === 28 ? '4W' : '3M'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="chart-legend">
                  <span>
                    <i className="legend-dot" /> Weigh-ins
                  </span>
                  <span>
                    <i className="legend-line" /> Weight trend
                  </span>
                  <span className="chart-unit">kg</span>
                </div>
                <TrendChart points={series} />
                <div className="chart-dates">
                  <span>{shortDate(shiftDate(today, -range + 1))}</span>
                  <span>{shortDate(shiftDate(today, -Math.floor(range / 2)))}</span>
                  <span>{shortDate(today)}</span>
                </div>
              </section>
              <div className="insight-bottom">
                <section className="card chart-card">
                  <div className="section-heading">
                    <div>
                      <h2>Nutrition, day by day.</h2>
                      <p>Your last seven days of energy intake.</p>
                    </div>
                    <Flame size={20} />
                  </div>
                  <div className="bar-chart">
                    {Array.from({ length: 7 }, (_, i) => {
                      const key = shiftDate(today, i - 6),
                        value = totals(data.days[key]?.entries || []).calories;
                      return (
                        <div key={key}>
                          <span>{fmt(value)}</span>
                          <div className="bar-track">
                            <div
                              className={key === today ? 'today-bar' : ''}
                              style={{
                                height: `${Math.min(100, (value / Math.max(profile.calories * 1.2, ...Object.values(data.days).map((d) => totals(d.entries).calories))) * 100)}%`,
                              }}
                            />
                          </div>
                          <small>
                            {new Date(key + 'T12:00:00').toLocaleDateString('en-US', {
                              weekday: 'short',
                            })}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                </section>
                <section className="card insight-note">
                  <span className="note-icon">
                    <Sparkles size={22} />
                  </span>
                  <h2>
                    Numbers tell a story.
                    <br />
                    You set the pace.
                  </h2>
                  <p>
                    Daily weight moves with water, meals, and life. Focus on your longer trend, and
                    check in with how you feel.
                  </p>
                  <button className="text-button" onClick={exportData}>
                    Export your data <Download size={16} />
                  </button>
                </section>
              </div>
            </>
          )}
          {page === 'My plan' && (
            <div className="plan-layout">
              <div>
                <section className="card plan-target">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">YOUR CURRENT TARGETS</span>
                      <h2>
                        {profile.goal === 'lose'
                          ? 'Steady, sustainable progress.'
                          : profile.goal === 'gain'
                            ? 'Build at your own pace.'
                            : 'Find your everyday balance.'}
                      </h2>
                    </div>
                    <button
                      className="icon-button"
                      aria-label="Edit nutrition targets"
                      onClick={() => open('settings')}
                    >
                      <SlidersHorizontal size={20} />
                    </button>
                  </div>
                  <div className="plan-calories">
                    <span className="round-icon">
                      <Flame size={25} />
                    </span>
                    <strong>
                      {fmt(profile.calories)}
                      <small>kcal / day</small>
                    </strong>
                    <span className="badge">
                      {profile.goal === 'lose'
                        ? 'LOSE WEIGHT'
                        : profile.goal === 'gain'
                          ? 'GAIN WEIGHT'
                          : 'MAINTAIN'}
                    </span>
                  </div>
                  <div className="target-grid">
                    {[
                      { name: 'Protein', value: profile.protein },
                      { name: 'Carbs', value: carbTarget(profile) },
                      { name: 'Fat', value: profile.fat },
                    ].map((s, i) => (
                      <div key={s.name} className={`macro-${['protein', 'carbs', 'fat'][i]}`}>
                        <span>
                          <i className="dot" />
                          {s.name}
                        </span>
                        <strong>
                          {s.value}
                          <small>g</small>
                        </strong>
                      </div>
                    ))}
                  </div>
                  <div className="goal-line">
                    <Scale size={18} />
                    <span>
                      Starting weight <strong>{profile.startWeight} kg</strong>
                    </span>
                    <ArrowRight size={16} />
                    <span>
                      Goal weight <strong>{profile.goalWeight} kg</strong>
                    </span>
                  </div>
                </section>
                <section className="card checkin-card">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">WEEKLY CHECK-IN</span>
                      <h2>
                        {locked
                          ? 'You’re all set for this week.'
                          : analysis.ready
                            ? 'Let’s see what your data says.'
                            : 'Good things take a little data.'}
                      </h2>
                    </div>
                    <span className="round-icon">
                      <Sparkles size={21} />
                    </span>
                  </div>
                  <p>
                    {analysis.ready
                      ? 'MacroFlow estimates your energy needs from logged intake and weight changes, then suggests a small adjustment. You always choose whether to apply it.'
                      : 'Log at least 14 complete days and 4 weigh-ins spanning 14 days in the last 28 days to unlock your first estimate.'}
                  </p>
                  <div className="checkin-progress">
                    <div>
                      <span>
                        <CheckCheck size={17} /> Completed days
                      </span>
                      <strong>
                        {analysis.logged} <small>/ 14</small>
                      </strong>
                      <div className="progress">
                        <div style={{ width: `${Math.min(100, (analysis.logged / 14) * 100)}%` }} />
                      </div>
                    </div>
                    <div>
                      <span>
                        <Scale size={17} /> Weigh-ins
                      </span>
                      <strong>
                        {analysis.weights} <small>/ 4</small>
                      </strong>
                      <div className="progress">
                        <div style={{ width: `${Math.min(100, (analysis.weights / 4) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <button
                    className="button primary"
                    disabled={!analysis.ready || locked}
                    onClick={() => open('checkin')}
                  >
                    {locked ? (
                      <>
                        <Check size={17} /> Checked in
                      </>
                    ) : (
                      <>
                        Review my check-in <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                  {locked && (
                    <span className="checkin-date">
                      Next check-in from {shortDate(shiftDate(profile.lastCheckIn!, 7))}
                    </span>
                  )}
                </section>
                <details className="card how-card">
                  <summary>
                    <CircleHelp size={20} /> How does the adaptive plan work?
                    <Plus size={18} />
                  </summary>
                  <p>
                    We use a linear trend through your weigh-ins and the average intake from
                    completed days over the last 28 days. Estimated expenditure is intake minus
                    weight change × 7,700 kcal/kg. This is a simplified estimate; hydration and
                    incomplete logging affect it.
                  </p>
                  <p>
                    Your goal adds a modest deficit (300 kcal), surplus (200 kcal), or no
                    adjustment. Each weekly change is capped at 100 kcal, and targets stay between
                    1,200 and 5,000 kcal. These bounds are not personalized medical guidance. You
                    can edit your targets anytime.
                  </p>
                </details>
              </div>
              <div className="right-column">
                <section className="focus-card plan-focus">
                  <span className="eyebrow">BUILT AROUND YOU</span>
                  <h2>
                    Your life changes.
                    <br />
                    Your plan can, too.
                  </h2>
                  <p>
                    No perfect weeks required. Honest logs and small steps give you a more useful
                    picture.
                  </p>
                  <Leaf size={76} strokeWidth={0.9} />
                </section>
                <section className="card tip-card">
                  <ShieldCheck size={24} />
                  <h2>Your data stays yours.</h2>
                  <p>
                    Your diary and weight history are saved on this device. Export a backup anytime.
                    Barcode lookup sends only the barcode to Open Food Facts.
                  </p>
                  <button className="text-button" onClick={exportData}>
                    Save a backup <Download size={16} />
                  </button>
                </section>
              </div>
            </div>
          )}
          <footer className="page-footer">
            <Brand />
            <span>Your nutrition. Your rhythm.</span>
            <span>Made for your everyday.</span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav">
        {navItems.map(({ name, icon: Icon }) => (
          <button
            key={name}
            className={page === name ? 'active' : ''}
            onClick={() => setPage(name)}
          >
            <Icon size={21} />
            <span>{name === 'Food diary' ? 'Diary' : name === 'My plan' ? 'Plan' : name}</span>
          </button>
        ))}
      </nav>
      {modal && (
        <Modal
          title={
            modal === 'food'
              ? 'A little nourishment.'
              : modal === 'weight'
                ? 'Check in with yourself.'
                : modal === 'checkin'
                  ? 'Your weekly check-in.'
                  : modal === 'setup'
                    ? 'Make yourself at home.'
                    : 'Your space, your way.'
          }
          onClose={() => setModal(null)}
        >
          {modal === 'food' ? (
            <FoodPicker
              data={data}
              meal={meal}
              setMeal={setMeal}
              onAdd={addFood}
              onFavorite={favorite}
            />
          ) : modal === 'weight' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const value = Number(new FormData(e.currentTarget).get('weight'));
                if (value < 30 || value > 350) {
                  setFormError('Enter a weight between 30 and 350 kg.');
                  return;
                }
                updateDay((d) => ({ ...d, weight: value }));
                setModal(null);
                setToast('Weight logged. One data point, a bigger picture.');
              }}
            >
              <p className="modal-description">
                {shortDate(selectedDate)} · A single number is just a snapshot.
              </p>
              <label className="field">
                Weight (kg)
                <input
                  name="weight"
                  type="number"
                  min="30"
                  max="350"
                  step="0.1"
                  defaultValue={day.weight || latest?.weight || profile.startWeight}
                  autoFocus
                  required
                />
              </label>
              {formError && <p className="error">{formError}</p>}
              <button className="button primary full-width" type="submit">
                Save weight <Check size={17} />
              </button>
            </form>
          ) : modal === 'checkin' ? (
            <div>
              <p className="modal-description">
                Based on {analysis.logged} completed days and {analysis.weights} weigh-ins.{' '}
                {analysis.confidence}.
              </p>
              <div className="checkin-result">
                <span>Estimated daily expenditure</span>
                <strong>
                  {fmt(analysis.expenditure)} <small>kcal</small>
                </strong>
                <span>
                  Observed change: {analysis.weeklyChange > 0 ? '+' : ''}
                  {analysis.weeklyChange.toFixed(2)} kg / week
                </span>
              </div>
              <div className="recommendation">
                <div>
                  <span>Current target</span>
                  <strong>{fmt(profile.calories)}</strong>
                </div>
                <ArrowRight size={24} />
                <div>
                  <span>Suggested target</span>
                  <strong>{fmt(analysis.recommended)}</strong>
                </div>
              </div>
              <p className="modal-description">
                This is an estimate, not a measurement. Your protein target stays steady; fat is
                reduced only if needed to fit your new calorie target.
              </p>
              <button
                className="button primary full-width"
                onClick={() => {
                  update((d) => ({
                    ...d,
                    profile: {
                      ...d.profile,
                      calories: analysis.recommended,
                      fat: Math.min(
                        d.profile.fat,
                        Math.floor((analysis.recommended - d.profile.protein * 4) / 9),
                      ),
                      lastCheckIn: today,
                    },
                  }));
                  setModal(null);
                  setToast('Plan updated. Here’s to another week.');
                }}
              >
                Apply suggestion <Check size={17} />
              </button>
              <button
                className="button ghost full-width"
                onClick={() => {
                  update((d) => ({ ...d, profile: { ...d.profile, lastCheckIn: today } }));
                  setModal(null);
                  setToast('Current targets kept for this week');
                }}
              >
                Keep my current targets
              </button>
            </div>
          ) : (
            <ProfileForm
              profile={modal === 'setup' ? newData().profile : profile}
              setup={modal === 'setup'}
              demo={demo}
              onSave={(p) => {
                if (modal === 'setup') {
                  const d = newData();
                  d.profile = p;
                  setUserData(d);
                  setDemo(false);
                } else update((d) => ({ ...d, profile: p }));
                setModal(null);
                setToast('You’re all set. Make today your own.');
              }}
              onExport={exportData}
              onImport={async (file) => {
                try {
                  if (file.size > 5 * 1024 * 1024) throw Error();
                  const parsed = JSON.parse(await file.text());
                  if (!validateData(parsed)) throw Error();
                  setUserData(parsed);
                  setDemo(false);
                  setModal(null);
                  setToast('Your backup has been restored');
                } catch {
                  setFormError('This is not a valid MacroFlow backup (maximum 5 MB).');
                }
              }}
              error={formError}
              onDemo={() => {
                setDemo(true);
                setModal(null);
                setPage('Today');
              }}
              onStart={() => {
                if (demo) leaveDemo();
                else open('setup');
              }}
            />
          )}
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
function TrendChart({
  points,
  small = false,
}: {
  points: ReturnType<typeof weightSeries>;
  small?: boolean;
}) {
  if (points.length < 2)
    return (
      <div className={small ? 'chart-empty small' : 'chart-empty'}>
        <ChartNoAxesCombined size={small ? 20 : 30} />
        <span>
          {small ? 'Your trend will appear here' : 'Log at least two weights to see your trend.'}
        </span>
      </div>
    );
  const W = 700,
    H = small ? 145 : 260,
    pad = small ? 8 : 24;
  const min = Math.min(...points.map((p) => Math.min(p.weight, p.trend))) - 0.15,
    max = Math.max(...points.map((p) => Math.max(p.weight, p.trend))) + 0.15;
  const start = Date.parse(points[0].date),
    span = Date.parse(points.at(-1)!.date) - start || 1;
  const x = (date: string) => pad + ((Date.parse(date) - start) / span) * (W - pad * 2);
  const y = (value: number) => H - pad - ((value - min) / (max - min)) * (H - pad * 2);
  const path = points.map((p, i) => `${i ? 'L' : 'M'} ${x(p.date)} ${y(p.trend)}`).join(' ');
  return (
    <svg
      className={small ? 'trend-chart small' : 'trend-chart'}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-label="Weight trend chart"
      role="img"
    >
      <defs>
        <linearGradient id={small ? 'weight-small' : 'weight-large'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a1c5b7" stopOpacity=".3" />
          <stop offset="100%" stopColor="#a1c5b7" stopOpacity="0" />
        </linearGradient>
      </defs>
      {!small &&
        [0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line
              x1="0"
              x2={W}
              y1={pad + (i * (H - pad * 2)) / 3}
              y2={pad + (i * (H - pad * 2)) / 3}
              stroke="#edf0ec"
              strokeDasharray="4 6"
            />
            <text x="8" y={pad + (i * (H - pad * 2)) / 3 - 6} fill="#8a958d" fontSize="11">
              {(max - (i * (max - min)) / 3).toFixed(1)}
            </text>
          </g>
        ))}
      <path
        d={`${path} L ${x(points.at(-1)!.date)} ${H} L ${x(points[0].date)} ${H} Z`}
        fill={`url(#${small ? 'weight-small' : 'weight-large'})`}
      />
      {!small && (
        <path
          d={points.map((p, i) => `${i ? 'L' : 'M'} ${x(p.date)} ${y(p.weight)}`).join(' ')}
          stroke="#c4d3c9"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 5"
        />
      )}
      <path
        d={path}
        stroke="#34745b"
        strokeWidth={small ? 2.5 : 3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {!small &&
        points.map((p) => (
          <circle key={p.date} cx={x(p.date)} cy={y(p.weight)} r="3" fill="#a5bfb0">
            <title>
              {shortDate(p.date)}: {p.weight} kg
            </title>
          </circle>
        ))}
    </svg>
  );
}
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const previous = document.activeElement as HTMLElement;
    ref.current?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = ref.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled),input:not(:disabled),select,summary,[tabindex="0"]',
      );
      if (!items?.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first || document.activeElement === ref.current)
      ) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener('keydown', trap);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">YOUR NUTRITION. YOUR RHYTHM.</span>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function FoodPicker({
  data,
  meal,
  setMeal,
  onAdd,
  onFavorite,
}: {
  data: AppData;
  meal: string;
  setMeal: (s: string) => void;
  onAdd: (f: Food, q: number) => void;
  onFavorite: (s: string) => void;
}) {
  const [query, setQuery] = useState(''),
    [tab, setTab] = useState('All foods'),
    [food, setFood] = useState<Food | null>(null),
    [qty, setQty] = useState('1'),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(false);
  const request = useRef(0);
  const all = [...data.foods, ...catalog];
  useEffect(
    () => () => {
      request.current++;
    },
    [],
  );
  const recentIds = Array.from(
    new Set(
      Object.keys(data.days)
        .sort()
        .reverse()
        .flatMap((k) => data.days[k].entries.map((f) => f.id)),
    ),
  );
  const list = all.filter(
    (f) =>
      (tab !== 'Favorites' || data.favorites.includes(f.id)) &&
      (tab !== 'Recent' || recentIds.includes(f.id)) &&
      `${f.name} ${f.brand}`.toLowerCase().includes(query.toLowerCase()),
  );
  async function lookup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const barcode = String(new FormData(e.currentTarget).get('barcode')).trim();
    if (!/^\d{8,14}$/.test(barcode)) {
      setError('Enter an 8–14 digit barcode from the package.');
      return;
    }
    setLoading(true);
    setError('');
    const id = ++request.current;
    try {
      const res = await CapacitorHttp.get({
        url: `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,nutriments`,
        connectTimeout: 12000,
        readTimeout: 12000,
      });
      if (id !== request.current) return;
      if (res.status !== 200 || res.data.status !== 1 || !res.data.product?.product_name)
        throw Error('No match found. Try creating a custom food from the label.');
      const p = res.data.product,
        n = p.nutriments;
      const values = ['energy-kcal_100g', 'proteins_100g', 'carbohydrates_100g', 'fat_100g'].map(
        (k) => Number(n?.[k]),
      );
      if (values.some((v) => !Number.isFinite(v) || v < 0 || v > 10000))
        throw Error('This product has incomplete nutrition data. Add it from the label instead.');
      setFood({
        id: 'barcode-' + barcode,
        name: p.product_name,
        brand: p.brands || 'Open Food Facts',
        serving: '100 g',
        category: 'other',
        barcode,
        calories: values[0],
        protein: values[1],
        carbs: values[2],
        fat: values[3],
      });
      setQty('1');
    } catch (err) {
      if (id === request.current)
        setError(
          err instanceof Error
            ? err.message
            : 'Lookup unavailable. Check your connection or add a custom food.',
        );
    } finally {
      if (id === request.current) setLoading(false);
    }
  }
  if (food)
    return (
      <div>
        <button className="text-button back-button" onClick={() => setFood(null)}>
          <ChevronLeft size={16} /> Back to foods
        </button>
        <div className="selected-food">
          <span className="food-avatar">
            <FoodIcon category={food.category} />
          </span>
          <h3>{food.name}</h3>
          <p>
            {food.brand} · {food.serving}
          </p>
        </div>
        <label className="field">
          Meal
          <select value={meal} onChange={(e) => setMeal(e.target.value)}>
            {meals.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Number of servings
          <input
            aria-label="Number of servings"
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </label>
        <div className="food-nutrients">
          {(['calories', 'protein', 'carbs', 'fat'] as const).map((k) => (
            <div key={k}>
              <strong>{fmt(food[k] * (Number(qty) || 0))}</strong>
              <span>{k === 'calories' ? 'kcal' : k + ' (g)'}</span>
            </div>
          ))}
        </div>
        <button
          className="button primary full-width"
          disabled={!Number(qty) || Number(qty) < 0.01 || Number(qty) > 100}
          onClick={() => onAdd(food, Number(qty))}
        >
          Add to {meal.toLowerCase()} <Plus size={18} />
        </button>
      </div>
    );
  return (
    <>
      <p className="modal-description">Find your favorites. Make room for something new.</p>
      <div className="food-search">
        <Search size={20} />
        <input
          placeholder="Search foods…"
          aria-label="Search foods"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="food-tabs">
        {['All foods', 'Recent', 'Favorites', 'Custom', 'Barcode'].map((t) => (
          <button
            className={tab === t ? 'active' : ''}
            key={t}
            onClick={() => {
              setTab(t);
              setError('');
            }}
          >
            {t === 'Barcode' && <ScanBarcode size={15} />} {t}
          </button>
        ))}
      </div>
      {tab === 'Custom' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const values = ['calories', 'protein', 'carbs', 'fat'].map((k) => Number(f.get(k)));
            if (values.some((v) => !Number.isFinite(v) || v < 0 || v > 10000)) return;
            setFood({
              id: crypto.randomUUID(),
              name: String(f.get('name')).trim(),
              brand: 'Custom food',
              serving: String(f.get('serving')).trim(),
              category: 'other',
              calories: values[0],
              protein: values[1],
              carbs: values[2],
              fat: values[3],
            });
            setQty('1');
          }}
        >
          <label className="field">
            Food name
            <input name="name" required maxLength={100} placeholder="e.g. My overnight oats" />
          </label>
          <label className="field">
            Serving size
            <input name="serving" required maxLength={80} placeholder="e.g. 1 jar · 250 g" />
          </label>
          <div className="form-grid">
            {['calories', 'protein', 'carbs', 'fat'].map((k, i) => (
              <label className="field" key={k}>
                {['Calories (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)'][i]}
                <input
                  name={k}
                  type="number"
                  min="0"
                  max="10000"
                  step="0.1"
                  defaultValue={0}
                  required
                />
              </label>
            ))}
          </div>
          <p className="modal-description">
            Use nutrition values for one serving from your food label.
          </p>
          <button className="button primary full-width">
            Continue <ArrowRight size={17} />
          </button>
        </form>
      ) : tab === 'Barcode' ? (
        <form onSubmit={lookup}>
          <div className="barcode-illustration">
            <ScanBarcode size={65} strokeWidth={1} />
          </div>
          <h3 className="center">From the label to your log.</h3>
          <p className="modal-description center">
            Enter the barcode digits on your packaging. Lookups use the community Open Food Facts
            database; check values against your label.
          </p>
          <label className="field">
            Barcode number
            <input
              name="barcode"
              inputMode="numeric"
              pattern="[0-9]{8,14}"
              placeholder="e.g. 3017620422003"
              required
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary full-width" disabled={loading}>
            {loading ? 'Looking up…' : 'Look up barcode'} <Search size={17} />
          </button>
          <p className="subtle center">Internet required · manual barcode entry</p>
        </form>
      ) : (
        <>
          <div className="food-list">
            {list.length ? (
              list.map((f) => (
                <div className="food-result" key={f.id}>
                  <button
                    className="food-select"
                    onClick={() => {
                      setFood(f);
                      setQty('1');
                    }}
                  >
                    <span className="food-avatar">
                      <FoodIcon category={f.category} />
                    </span>
                    <div>
                      <strong>{f.name}</strong>
                      <span>
                        {f.brand} · {f.serving}
                      </span>
                    </div>
                    <span className="food-kcal">
                      {fmt(f.calories)}
                      <small>kcal</small>
                    </span>
                  </button>
                  <button
                    className={`icon-button favorite ${data.favorites.includes(f.id) ? 'saved' : ''}`}
                    aria-label={`${data.favorites.includes(f.id) ? 'Unfavorite' : 'Favorite'} ${f.name}`}
                    onClick={() => onFavorite(f.id)}
                  >
                    <Star size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-food">
                <Search size={28} />
                <h3>
                  {tab === 'Favorites' ? 'Your favorites belong here.' : 'No foods here yet.'}
                </h3>
                <p>
                  {tab === 'Favorites'
                    ? 'Tap the star beside any food to save it.'
                    : 'Try another search, or create a custom food.'}
                </p>
                <button className="text-button" onClick={() => setTab('Custom')}>
                  Create a food <Plus size={16} />
                </button>
              </div>
            )}
          </div>
          <p className="subtle">
            Starter food values are estimates. Check your package for exact nutrition.
          </p>
        </>
      )}
    </>
  );
}
function FoodIcon({ category }: { category: string }) {
  const Icon =
    category === 'fruit'
      ? Apple
      : category === 'drink'
        ? Coffee
        : category === 'vegetable'
          ? Leaf
          : category === 'protein'
            ? Flame
            : Utensils;
  return <Icon size={21} />;
}
function ProfileForm({
  profile,
  setup,
  demo,
  onSave,
  onExport,
  onImport,
  error,
  onDemo,
  onStart,
}: {
  profile: Profile;
  setup: boolean;
  demo: boolean;
  onSave: (p: Profile) => void;
  onExport: () => void;
  onImport: (f: File) => void;
  error: string;
  onDemo: () => void;
  onStart: () => void;
}) {
  const [localError, setLocalError] = useState(''),
    [confirmed, setConfirmed] = useState(false);
  const [c, setC] = useState(profile.calories),
    [p, setP] = useState(profile.protein),
    [f, setF] = useState(profile.fat);
  return (
    <>
      <p className="modal-description">
        {setup
          ? 'Start with targets that work for you. You can adjust them anytime.'
          : 'Your goals are personal. Make this space feel like you.'}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          if (p * 4 + f * 9 > c) {
            setLocalError(
              'Protein and fat exceed your calorie target. Reduce them to leave room for carbs.',
            );
            return;
          }
          const name = String(form.get('name')).trim();
          if (!name) {
            setLocalError('Add a name to get started.');
            return;
          }
          onSave({
            ...profile,
            name,
            calories: c,
            protein: p,
            fat: f,
            startWeight: Number(form.get('startWeight')),
            goalWeight: Number(form.get('goalWeight')),
            goal: String(form.get('goal')) as Profile['goal'],
          });
        }}
      >
        <label className="field">
          What should we call you?
          <input
            name="name"
            defaultValue={setup ? '' : profile.name}
            maxLength={24}
            placeholder="Your first name"
            required
          />
        </label>
        <label className="field">
          Your goal
          <select name="goal" defaultValue={profile.goal}>
            <option value="lose">Lose weight gradually</option>
            <option value="maintain">Maintain my weight</option>
            <option value="gain">Gain weight gradually</option>
          </select>
        </label>
        <div className="form-grid">
          <label className="field">
            Starting weight (kg)
            <input
              name="startWeight"
              defaultValue={profile.startWeight}
              type="number"
              min="30"
              max="350"
              step="0.1"
              required
            />
          </label>
          <label className="field">
            Goal weight (kg)
            <input
              name="goalWeight"
              defaultValue={profile.goalWeight}
              type="number"
              min="30"
              max="350"
              step="0.1"
              required
            />
          </label>
        </div>
        <label className="field">
          Daily calorie target (kcal)
          <input
            type="number"
            min="1200"
            max="5000"
            step="10"
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            required
          />
        </label>
        <div className="form-grid">
          <label className="field">
            Protein (g)
            <input
              type="number"
              min="0"
              max="400"
              value={p}
              onChange={(e) => setP(Number(e.target.value))}
              required
            />
          </label>
          <label className="field">
            Fat (g)
            <input
              type="number"
              min="0"
              max="300"
              value={f}
              onChange={(e) => setF(Number(e.target.value))}
              required
            />
          </label>
        </div>
        <p className="subtle">
          Carbs use the remaining calories: {Math.max(0, Math.round((c - p * 4 - f * 9) / 4))} g /
          day. Targets are intended for adults; choose them with a qualified professional if needed.
        </p>
        {localError && (
          <p className="error" role="alert">
            {localError}
          </p>
        )}
        <button className="button primary full-width">
          {setup ? 'Let’s get started' : 'Save my settings'} <ArrowRight size={17} />
        </button>
      </form>
      {!setup && (
        <div className="data-settings">
          <h3>Your data</h3>
          <p className="subtle">
            Local storage · no account required. Back up before reinstalling or clearing app data.
          </p>
          <div className="data-buttons">
            <button className="button secondary" onClick={onExport}>
              <Download size={16} /> Export backup
            </button>
            <label className="button secondary import-label">
              <Upload size={16} /> Restore backup
              <input
                type="file"
                accept="application/json,.json"
                onChange={(e) => {
                  if (e.target.files?.[0]) onImport(e.target.files[0]);
                }}
              />
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          {demo ? (
            <button className="text-button" onClick={onStart}>
              Start your own diary <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button className="text-button" onClick={onDemo}>
                Explore sample data <Sparkles size={16} />
              </button>
              <button className="text-button danger" onClick={() => setConfirmed(true)}>
                Start over with a fresh diary
              </button>
              {confirmed && (
                <div className="reset-confirm">
                  <p>
                    Starting fresh replaces your saved diary when you finish setup. Export a backup
                    first if you want to keep it.
                  </p>
                  <button className="button secondary" onClick={() => setConfirmed(false)}>
                    Cancel
                  </button>
                  <button className="button primary" onClick={onStart}>
                    Continue to setup
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
