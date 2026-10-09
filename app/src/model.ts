export type Macros = { calories: number; protein: number; carbs: number; fat: number };
export type Food = Macros & {
  id: string;
  name: string;
  brand: string;
  serving: string;
  category: string;
  barcode?: string;
};
export type Entry = Food & { entryId: string; meal: string; quantity: number };
export type Day = { entries: Entry[]; water: number; weight?: number; complete: boolean };
export type Profile = {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  startWeight: number;
  goalWeight: number;
  goal: 'lose' | 'maintain' | 'gain';
  lastCheckIn?: string;
};
export type AppData = {
  version: 1;
  profile: Profile;
  days: Record<string, Day>;
  foods: Food[];
  favorites: string[];
};
export const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
export const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function shiftDate(key: string, offset: number) {
  const d = new Date(key + 'T12:00:00');
  d.setDate(d.getDate() + offset);
  return dateKey(d);
}
export const emptyDay = (): Day => ({ entries: [], water: 0, complete: false });
export const catalog: Food[] = [
  {
    id: 'oats',
    name: 'Rolled oats',
    brand: 'Whole food',
    serving: '40 g · dry',
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 3,
    category: 'grain',
  },
  {
    id: 'yogurt',
    name: 'Greek yogurt',
    brand: 'Plain · nonfat',
    serving: '170 g · ¾ cup',
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0,
    category: 'dairy',
  },
  {
    id: 'blueberries',
    name: 'Blueberries',
    brand: 'Fresh',
    serving: '100 g',
    calories: 57,
    protein: 1,
    carbs: 14,
    fat: 0,
    category: 'fruit',
  },
  {
    id: 'banana',
    name: 'Banana',
    brand: 'Fresh',
    serving: '1 medium · 118 g',
    calories: 105,
    protein: 1,
    carbs: 27,
    fat: 0,
    category: 'fruit',
  },
  {
    id: 'chicken',
    name: 'Chicken breast',
    brand: 'Cooked · skinless',
    serving: '150 g',
    calories: 248,
    protein: 47,
    carbs: 0,
    fat: 5,
    category: 'protein',
  },
  {
    id: 'rice',
    name: 'Brown rice',
    brand: 'Cooked',
    serving: '150 g',
    calories: 185,
    protein: 4,
    carbs: 38,
    fat: 2,
    category: 'grain',
  },
  {
    id: 'avocado',
    name: 'Avocado',
    brand: 'Fresh',
    serving: '½ medium · 75 g',
    calories: 120,
    protein: 2,
    carbs: 6,
    fat: 11,
    category: 'fruit',
  },
  {
    id: 'salmon',
    name: 'Atlantic salmon',
    brand: 'Cooked',
    serving: '150 g',
    calories: 309,
    protein: 33,
    carbs: 0,
    fat: 19,
    category: 'protein',
  },
  {
    id: 'egg',
    name: 'Egg',
    brand: 'Whole · large',
    serving: '1 egg · 50 g',
    calories: 72,
    protein: 6,
    carbs: 0,
    fat: 5,
    category: 'protein',
  },
  {
    id: 'bread',
    name: 'Whole-wheat bread',
    brand: 'Whole grain',
    serving: '1 slice · 40 g',
    calories: 100,
    protein: 4,
    carbs: 18,
    fat: 2,
    category: 'grain',
  },
  {
    id: 'almonds',
    name: 'Almonds',
    brand: 'Raw · unsalted',
    serving: '28 g · small handful',
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    category: 'nuts',
  },
  {
    id: 'whey',
    name: 'Whey protein',
    brand: 'Generic · check your label',
    serving: '1 scoop · 30 g',
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1,
    category: 'protein',
  },
  {
    id: 'tofu',
    name: 'Firm tofu',
    brand: 'Plain',
    serving: '150 g',
    calories: 180,
    protein: 20,
    carbs: 4,
    fat: 10,
    category: 'protein',
  },
  {
    id: 'broccoli',
    name: 'Broccoli',
    brand: 'Steamed',
    serving: '150 g',
    calories: 53,
    protein: 4,
    carbs: 11,
    fat: 1,
    category: 'vegetable',
  },
  {
    id: 'oil',
    name: 'Olive oil',
    brand: 'Extra virgin',
    serving: '1 tbsp · 14 g',
    calories: 119,
    protein: 0,
    carbs: 0,
    fat: 14,
    category: 'other',
  },
  {
    id: 'peanut',
    name: 'Peanut butter',
    brand: 'Smooth',
    serving: '2 tbsp · 32 g',
    calories: 190,
    protein: 7,
    carbs: 7,
    fat: 16,
    category: 'nuts',
  },
  {
    id: 'apple',
    name: 'Apple',
    brand: 'Fresh · with skin',
    serving: '1 medium · 182 g',
    calories: 95,
    protein: 0,
    carbs: 25,
    fat: 0,
    category: 'fruit',
  },
  {
    id: 'milk',
    name: 'Milk',
    brand: '2% reduced fat',
    serving: '240 ml · 1 cup',
    calories: 122,
    protein: 8,
    carbs: 12,
    fat: 5,
    category: 'dairy',
  },
  {
    id: 'potato',
    name: 'Sweet potato',
    brand: 'Baked',
    serving: '150 g',
    calories: 135,
    protein: 3,
    carbs: 31,
    fat: 0,
    category: 'vegetable',
  },
  {
    id: 'coffee',
    name: 'Black coffee',
    brand: 'Brewed · unsweetened',
    serving: '240 ml · 1 cup',
    calories: 2,
    protein: 0,
    carbs: 0,
    fat: 0,
    category: 'drink',
  },
];
export function totals(entries: Entry[]): Macros {
  return entries.reduce(
    (t, e) => ({
      calories: t.calories + e.calories * e.quantity,
      protein: t.protein + e.protein * e.quantity,
      carbs: t.carbs + e.carbs * e.quantity,
      fat: t.fat + e.fat * e.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
export const carbTarget = (p: Profile) =>
  Math.max(0, Math.round((p.calories - p.protein * 4 - p.fat * 9) / 4));
export function newData(): AppData {
  return {
    version: 1,
    profile: {
      name: 'Alex',
      calories: 2200,
      protein: 150,
      fat: 70,
      startWeight: 80,
      goalWeight: 75,
      goal: 'lose',
    },
    days: {},
    foods: [],
    favorites: [],
  };
}
export function demoData(): AppData {
  const data = newData();
  data.profile = {
    name: 'Alex',
    calories: 2150,
    protein: 150,
    fat: 70,
    startWeight: 81.5,
    goalWeight: 75,
    goal: 'lose',
  };
  data.favorites = ['yogurt', 'chicken', 'oats'];
  const today = dateKey();
  for (let i = 27; i >= 1; i--) {
    const key = shiftDate(today, -i);
    const c = 2200 + ((i % 5) - 2) * 60;
    data.days[key] = {
      entries: [
        {
          id: 'sample',
          entryId: 'sample-' + i,
          name: 'Sample daily intake',
          brand: 'Demo data',
          serving: '1 day',
          category: 'other',
          calories: c,
          protein: 145 + (i % 3) * 5,
          carbs: 240,
          fat: 70,
          meal: 'Lunch',
          quantity: 1,
        },
      ],
      water: 1750 + (i % 4) * 250,
      weight: Math.round((79.4 + i * 0.041 + Math.sin(i) * 0.16) * 10) / 10,
      complete: true,
    };
  }
  const items = [
    ['oats', 'Breakfast', 1],
    ['yogurt', 'Breakfast', 1],
    ['blueberries', 'Breakfast', 1],
    ['chicken', 'Lunch', 1],
    ['rice', 'Lunch', 1.5],
    ['avocado', 'Lunch', 1],
    ['whey', 'Snacks', 1],
    ['banana', 'Snacks', 1],
  ] as const;
  data.days[today] = {
    entries: items.map(([id, meal, quantity], i) => ({
      ...catalog.find((f) => f.id === id)!,
      entryId: 'today-' + i,
      meal,
      quantity,
    })),
    water: 1250,
    weight: 79.4,
    complete: false,
  };
  return data;
}
export function weightSeries(data: AppData, end = dateKey(), length = 28) {
  let trend: number | undefined;
  const all = Object.entries(data.days)
    .filter(([key, d]) => key <= end && d.weight !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return all
    .map(([date, d]) => {
      trend = trend === undefined ? d.weight! : 0.25 * d.weight! + 0.75 * trend;
      return { date, weight: d.weight!, trend };
    })
    .filter((p) => p.date >= shiftDate(end, -length + 1));
}
export function adaptive(data: AppData, today = dateKey()) {
  const start = shiftDate(today, -28);
  const days = Object.entries(data.days).filter(
    ([date, d]) => date >= start && date < today && d.complete && d.entries.length > 0,
  );
  const weights = weightSeries(data, shiftDate(today, -1), 28);
  const span =
    weights.length > 1
      ? (Date.parse(weights.at(-1)!.date) - Date.parse(weights[0].date)) / 86400000
      : 0;
  const ready = days.length >= 14 && weights.length >= 4 && span >= 14;
  if (!ready)
    return {
      ready: false,
      logged: days.length,
      weights: weights.length,
      expenditure: 0,
      weeklyChange: 0,
      recommended: data.profile.calories,
      confidence: 'Building baseline',
    };
  const x = weights.map((p) => (Date.parse(p.date) - Date.parse(weights[0].date)) / 86400000),
    y = weights.map((p) => p.weight);
  const mx = x.reduce((a, b) => a + b, 0) / x.length,
    my = y.reduce((a, b) => a + b, 0) / y.length;
  const slope =
    x.reduce((v, t, i) => v + (t - mx) * (y[i] - my), 0) / x.reduce((v, t) => v + (t - mx) ** 2, 0);
  const intake = days.reduce((v, [, d]) => v + totals(d.entries).calories, 0) / days.length;
  const expenditure = Math.round(Math.max(1200, Math.min(5000, intake - slope * 7700)) / 10) * 10;
  const desired =
    expenditure + (data.profile.goal === 'lose' ? -300 : data.profile.goal === 'gain' ? 200 : 0);
  const bounded = Math.max(1200, data.profile.protein * 4, Math.min(5000, desired));
  const recommended = Math.max(
    data.profile.protein * 4,
    Math.round(
      (data.profile.calories + Math.max(-100, Math.min(100, bounded - data.profile.calories))) / 10,
    ) * 10,
  );
  return {
    ready: true,
    logged: days.length,
    weights: weights.length,
    expenditure,
    weeklyChange: slope * 7,
    recommended,
    confidence:
      days.length >= 21 && weights.length >= 10 ? 'Established baseline' : 'Early estimate',
  };
}
export function validateData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false;
  const d = value as AppData,
    p = d.profile;
  const num = (n: unknown, min = 0, max = 100000) =>
    typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
  const validDate = (date: unknown) =>
    typeof date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    dateKey(new Date(date + 'T12:00:00')) === date;
  const food = (f: Food) =>
    f &&
    typeof f.id === 'string' &&
    typeof f.name === 'string' &&
    typeof f.brand === 'string' &&
    typeof f.serving === 'string' &&
    typeof f.category === 'string' &&
    ['calories', 'protein', 'carbs', 'fat'].every((k) => num(f[k as keyof Macros], 0, 10000));
  return (
    d.version === 1 &&
    !!p &&
    typeof p.name === 'string' &&
    num(p.calories, 1200, 5000) &&
    num(p.protein, 0, 400) &&
    num(p.fat, 0, 300) &&
    p.protein * 4 + p.fat * 9 <= p.calories &&
    num(p.startWeight, 30, 350) &&
    num(p.goalWeight, 30, 350) &&
    ['lose', 'maintain', 'gain'].includes(p.goal) &&
    (p.lastCheckIn === undefined || validDate(p.lastCheckIn)) &&
    Array.isArray(d.foods) &&
    d.foods.every(food) &&
    Array.isArray(d.favorites) &&
    d.favorites.every((f) => typeof f === 'string') &&
    !!d.days &&
    typeof d.days === 'object' &&
    !Array.isArray(d.days) &&
    Object.entries(d.days).every(
      ([date, day]) =>
        validDate(date) &&
        day &&
        Array.isArray(day.entries) &&
        day.entries.every(
          (e) =>
            food(e) &&
            typeof e.entryId === 'string' &&
            meals.includes(e.meal) &&
            num(e.quantity, 0.01, 100),
        ) &&
        num(day.water, 0, 20000) &&
        typeof day.complete === 'boolean' &&
        (day.weight === undefined || num(day.weight, 30, 350)),
    )
  );
}
