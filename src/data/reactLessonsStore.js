// Styling with Tailwind and global state with Redux Toolkit.
import { lesson } from "./reactLessonSchema.js";

const detailed = (base, extra) => ({ ...base, ...extra });

export const storeLessons = {
  "tailwind-and-redux--tailwind-css-in-react": detailed(
    lesson(
      "Tailwind CSS is a utility-first framework: instead of writing a class like .card in a stylesheet, you compose small single-purpose classes such as p-4, rounded-lg, and shadow directly in JSX. Components become the unit of reuse, so styles stay next to the markup they affect.",
      [
        "Tailwind scans your source files for class names and generates only the CSS those classes need. Unused utilities never reach the bundle, which keeps the stylesheet small even though the framework offers thousands of options.",
        "Variants are prefixes that apply a utility under a condition: md: for a breakpoint, hover: and focus-visible: for interaction states, and dark: for a dark color scheme. They read left to right, so md:hover:bg-gray-100 means on medium screens and up, while hovered.",
        "Because Tailwind finds classes by reading text, class names must appear whole in your code. Building names at runtime, such as 'bg-' + color + '-500', produces classes the scanner never saw, so their styles are missing.",
      ],
      `// Setup (Tailwind v4 with Vite):
// npm install tailwindcss @tailwindcss/vite
// vite.config.js -> plugins: [react(), tailwindcss()]
// src/index.css  -> @import "tailwindcss";

const badgeStyles = {
  veg: 'bg-green-100 text-green-800',
  nonveg: 'bg-red-100 text-red-800',
};

function DishCard({ name, price, type }) {
  return (
    <article className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 shadow-sm transition hover:shadow-md dark:border-gray-700">
      <div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-gray-500">₹{price}</p>
      </div>
      <span className={'rounded-full px-3 py-1 text-xs font-medium ' + badgeStyles[type]}>
        {type === 'veg' ? 'Veg' : 'Non-veg'}
      </span>
    </article>
  );
}

export default function Menu() {
  return (
    <section className="mx-auto grid max-w-4xl gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
      <DishCard name="Paneer tikka" price={240} type="veg" />
      <DishCard name="Chicken 65" price={280} type="nonveg" />
      <DishCard name="Masala dosa" price={120} type="veg" />
    </section>
  );
}`,
      "The grid is one column on phones, two from the sm breakpoint, and three from lg. Each card lifts its shadow on hover. The badge colors come from a lookup object whose values are complete class strings, so Tailwind's scanner finds every class it needs.",
      ["Utility classes in JSX", "Scanner finds used classes", "Small generated CSS"],
      "Copying the same 15 utilities onto many elements is a sign you need a component, not a bigger class list. Extract DishCard or a Button component and reuse it, rather than reaching for @apply everywhere.",
      "Why does className={`text-${size}`} sometimes render with no font size?",
      "Tailwind never saw the full class names text-sm or text-lg in your source, only the template, so it did not generate them. Map each option to a complete class string, for example const sizes = { small: 'text-sm', large: 'text-lg' }.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "Customising the design system",
          paragraphs: [
            "Tailwind v4 is configured in CSS. An @theme block defines design tokens such as brand colors and fonts, and Tailwind turns each token into utilities and CSS variables automatically. Keeping tokens in one place prevents a codebase full of slightly different greens.",
          ],
          code: `/* src/index.css */
@import "tailwindcss";

@theme {
  --color-brand: #fc8019;
  --font-display: "Poppins", sans-serif;
}

/* Now bg-brand, text-brand and font-display are available. */`,
        },
        {
          heading: "Habits that keep Tailwind code readable",
          points: [
            "Order classes consistently, from layout to spacing to typography to color. The official Prettier plugin can sort them for you.",
            "Use arbitrary values like w-[340px] sparingly; repeated ones belong in the theme.",
            "For conditional classes, a tiny helper such as clsx keeps logic readable: clsx('px-3', active && 'bg-brand').",
            "Accessibility is still your job: utilities do not add focus styles or labels, so include focus-visible: variants and semantic elements.",
          ],
        },
      ],
      animation: {
        title: "How Tailwind builds only what you use",
        nodes: [
          { id: "jsx", label: "JSX files", sub: "className strings" },
          { id: "scan", label: "Scanner", sub: "finds class names" },
          { id: "engine", label: "Tailwind engine", sub: "theme + variants" },
          { id: "css", label: "Generated CSS", sub: "only used rules" },
          { id: "browser", label: "Browser", sub: "styled UI" },
        ],
        steps: [
          {
            from: "jsx",
            to: "scan",
            label: "read",
            note: "The build reads your source files as text looking for class-like tokens.",
          },
          {
            from: "scan",
            to: "engine",
            label: "p-4 md:grid",
            note: "Each found token is matched against utilities, variants, and theme values.",
          },
          {
            from: "engine",
            to: "css",
            label: "emit",
            note: "Only rules for classes that actually appear are generated.",
          },
          {
            from: "css",
            to: "browser",
            label: "load",
            note: "The small stylesheet ships with the bundle and styles every component.",
          },
        ],
      },
    },
  ),

  "tailwind-and-redux--redux-toolkit-store-and-slices": detailed(
    lesson(
      "Redux keeps shared application state in a single store outside your component tree. Redux Toolkit is the official, modern way to write it: configureStore creates the store with good defaults, and createSlice generates a reducer and its action creators from one object.",
      [
        "The store holds one state object built from slices. Each slice owns one area, such as cart or user, and has a name, an initialState, and reducer functions that describe how actions change that area.",
        "Inside createSlice reducers you can write code that looks like mutation, such as state.items.push(item). Toolkit uses Immer to record those changes and produce a new immutable state, so the original is never modified.",
        "Components never edit the store directly. They dispatch actions, plain objects like { type: 'cart/addItem', payload }, and the matching reducer calculates the next state. Every change therefore goes through one predictable, inspectable path.",
      ],
      `// src/store/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addItem(state, action) {
      const existing = state.items.find(item => item.id === action.payload.id);
      if (existing) existing.qty += 1;
      else state.items.push({ ...action.payload, qty: 1 });
    },
    removeItem(state, action) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCart() {
      return { items: [] }; // returning a new value also works
    },
  },
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// src/store/appStore.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice.js';

export const appStore = configureStore({ reducer: { cart: cartReducer } });

// src/main.jsx
import { Provider } from 'react-redux';
createRoot(document.getElementById('root')).render(
  <Provider store={appStore}><App /></Provider>
);`,
      "createSlice generated three action creators. Calling addItem(dish) returns { type: 'cart/addItem', payload: dish }. configureStore combines the cart reducer under the cart key, and Provider makes the store available to every component below it. Install with npm install @reduxjs/toolkit react-redux.",
      ["dispatch(action)", "Slice reducer (Immer)", "New store state"],
      "Inside one reducer, either mutate the draft or return a new value, never both. Writing state.items.push(x) and then return { items: [] } throws, because Immer cannot tell which change you meant.",
      "Why not keep the cart in React context instead of Redux?",
      "For a small app, context plus useReducer is often enough. Redux adds value when many distant components read and update the same state frequently: selectors let each component subscribe to just the piece it needs, DevTools record every action, and middleware handles async logic in one place.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "What Immer is doing for you",
          paragraphs: [
            "Redux requires that reducers never change existing state, because components detect changes by comparing references. Writing that by hand means spreading every level you touch. Immer gives the reducer a draft proxy, records the operations you perform, and builds the new state with structural sharing: unchanged branches keep their old references.",
          ],
          code: `// Without Immer: copy every level you touch
return { ...state, items: state.items.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i) };

// With createSlice: describe the change
state.items.find(i => i.id === id).qty += 1;`,
        },
        {
          heading: "Rules of a good reducer",
          points: [
            "Pure: same state and action always give the same result.",
            "No side effects: no fetch calls, timers, or random IDs inside reducers.",
            "Serializable: keep plain objects, arrays, strings, and numbers in the store, not class instances, promises, or DOM nodes.",
            "Small: one slice per domain concept keeps reducers easy to test.",
          ],
        },
        {
          heading: "Inspecting changes with Redux DevTools",
          paragraphs: [
            "configureStore enables the Redux DevTools browser extension automatically in development. You can see every dispatched action, the state before and after it, and a diff, and you can step back in time to replay how the app reached a bug.",
          ],
        },
      ],
      animation: {
        title: "One-way data flow in Redux",
        nodes: [
          { id: "ui", label: "Component", sub: "Add button" },
          { id: "action", label: "Action", sub: "cart/addItem" },
          { id: "reducer", label: "cartSlice", sub: "reducer + Immer" },
          { id: "store", label: "Store", sub: "{ cart: {...} }" },
          { id: "header", label: "Header", sub: "cart count" },
        ],
        steps: [
          {
            from: "ui",
            to: "action",
            label: "dispatch",
            note: "Clicking Add dispatches addItem(dish), a plain action object.",
          },
          {
            from: "action",
            to: "reducer",
            label: "type",
            note: "The store routes the action to the reducer that handles cart/addItem.",
          },
          {
            from: "reducer",
            to: "store",
            label: "next",
            note: "The reducer produces the next state immutably and the store saves it.",
          },
          {
            from: "store",
            to: "header",
            label: "notify",
            note: "Subscribed components whose selected data changed re-render.",
          },
          {
            from: "header",
            to: "ui",
            label: "UI",
            note: "The header now shows the new count, and the cycle is ready for the next action.",
          },
        ],
      },
    },
  ),

  "tailwind-and-redux--useselector-and-usedispatch": detailed(
    lesson(
      "React-Redux connects components to the store with two Hooks. useSelector reads a value and subscribes the component to changes in that value; useDispatch returns the function that sends actions. How narrowly you select decides how often each component re-renders.",
      [
        "useSelector(state => state.cart.items) runs your selector after every dispatched action and compares the result with the previous one using ===. Only when the result is different does the component re-render.",
        "Selecting the whole store, useSelector(state => state), returns a new object after any change anywhere, so the component re-renders on every action in the app. Select the smallest piece you need.",
        "useDispatch returns the store's dispatch function, which is stable between renders. Pass it action creators generated by your slice: dispatch(addItem(dish)).",
      ],
      `import { useDispatch, useSelector } from 'react-redux';
import { addItem, clearCart } from './store/cartSlice.js';

function CartBadge() {
  const count = useSelector(state =>
    state.cart.items.reduce((sum, item) => sum + item.qty, 0),
  );
  return <span aria-label={count + ' items in cart'}>🛒 {count}</span>;
}

function MenuItem({ dish }) {
  const dispatch = useDispatch();
  return (
    <li>
      {dish.name} · ₹{dish.price}
      <button onClick={() => dispatch(addItem(dish))}>Add</button>
    </li>
  );
}

export default function Restaurant({ dishes }) {
  const dispatch = useDispatch();
  return (
    <main>
      <header><CartBadge /> <button onClick={() => dispatch(clearCart())}>Clear</button></header>
      <ul>{dishes.map(dish => <MenuItem key={dish.id} dish={dish} />)}</ul>
    </main>
  );
}`,
      "CartBadge selects a single number. Adding a dish changes that number, so the badge re-renders; MenuItem rows select nothing, so they do not re-render when the cart changes. Both buttons only dispatch, which keeps components ignorant of how the cart is stored.",
      ["useDispatch → action", "Store updates", "useSelector re-reads"],
      "Returning a new object or array from a selector, like state => ({ items: state.cart.items, total }) or state => state.cart.items.filter(...), produces a fresh reference every time, so the component re-renders after every action. Return primitives, use several selectors, or memoize with createSelector.",
      "Two components both call useSelector(state => state.cart.items). An unrelated user slice updates. Which of them re-render?",
      "Neither. The selector returns the same items array reference because the cart slice did not change, so === comparison passes and React-Redux skips the render.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "Memoized selectors for derived data",
          paragraphs: [
            "createSelector, re-exported by Redux Toolkit, caches its result and only recomputes when its inputs change. That keeps derived arrays referentially stable and avoids repeating expensive calculations.",
          ],
          code: `import { createSelector } from '@reduxjs/toolkit';

const selectItems = state => state.cart.items;

export const selectVegItems = createSelector([selectItems], items =>
  items.filter(item => item.isVeg),
);

// In a component: same array reference until cart.items changes
const vegItems = useSelector(selectVegItems);`,
        },
        {
          heading: "Testing components that use the store",
          points: [
            "Create a fresh store per test with configureStore and wrap the component in Provider, so tests never share state.",
            "Assert on what the user sees, such as the badge text, rather than on internal actions.",
            "Keep reducers and selectors pure so they can be unit tested without rendering anything.",
          ],
        },
      ],
      animation: {
        title: "Who re-renders after an action?",
        nodes: [
          { id: "button", label: "MenuItem", sub: "dispatch(addItem)", x: 18, y: 28 },
          { id: "store", label: "Store", sub: "cart changed", x: 50, y: 28 },
          { id: "badge", label: "CartBadge", sub: "count: 2 → 3", x: 82, y: 28 },
          { id: "list", label: "MenuItem rows", sub: "nothing selected", x: 30, y: 76 },
          { id: "profile", label: "UserMenu", sub: "selects user", x: 70, y: 76 },
        ],
        steps: [
          {
            from: "button",
            to: "store",
            label: "action",
            note: "A MenuItem dispatches addItem; the cart reducer creates a new cart state.",
          },
          {
            from: "store",
            to: "badge",
            label: "3 ≠ 2",
            note: "CartBadge's selector now returns 3 instead of 2, so it re-renders.",
          },
          {
            from: "store",
            to: "profile",
            label: "same ref",
            note: "UserMenu's selector returns the same user object, so it is skipped.",
          },
          {
            from: "store",
            to: "list",
            label: "no sub",
            note: "Rows that only dispatch do not subscribe to the cart at all.",
          },
        ],
      },
    },
  ),

  "tailwind-and-redux--async-logic-with-redux-thunks": detailed(
    lesson(
      "Reducers must stay pure, so network requests live outside them. Redux Toolkit's createAsyncThunk wraps an async function and dispatches pending, fulfilled, and rejected actions around it, letting a slice track loading and error states in the store.",
      [
        "A thunk is a function that receives dispatch and getState and can run async work before dispatching real actions. configureStore includes the thunk middleware by default.",
        "createAsyncThunk('menu/fetch', async (id) => ...) generates three action types. Your slice handles them in extraReducers to set status to loading, store the data, or record the error.",
        "Keeping request status in the store lets any component show a spinner or retry button without owning the request itself. For many endpoints with caching needs, RTK Query builds on the same ideas and removes most of this boilerplate.",
      ],
      `import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchMenu = createAsyncThunk('menu/fetch', async (restaurantId, { signal }) => {
  const res = await fetch('/api/menu/' + restaurantId, { signal });
  if (!res.ok) throw new Error('Menu request failed: ' + res.status);
  return res.json();
});

const menuSlice = createSlice({
  name: 'menu',
  initialState: { status: 'idle', data: null, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchMenu.fulfilled, (state, action) => { state.status = 'succeeded'; state.data = action.payload; })
      .addCase(fetchMenu.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default menuSlice.reducer;

// In a component:
// useEffect(() => {
//   const promise = dispatch(fetchMenu(id));
//   return () => promise.abort();
// }, [dispatch, id]);`,
      "Dispatching fetchMenu(42) immediately dispatches menu/fetch/pending, then menu/fetch/fulfilled with the JSON, or menu/fetch/rejected with the error. The component's effect aborts the request if the restaurant changes or the page unmounts, and the rejected handler ignores those aborts.",
      ["dispatch(thunk)", "pending → fulfilled | rejected", "status in store"],
      "Calling fetch inside a reducer, or storing the Response or a Promise in state, breaks Redux's rules. Do async work in a thunk and store only serializable results such as the parsed JSON and a status string.",
      "How would you avoid refetching a menu that is already loaded?",
      "Pass a condition option to createAsyncThunk that reads getState and returns false when status is loading or the data for that id is already present. For broader caching, invalidation, and deduplication, use RTK Query.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "Reading status in the UI",
          code: `function MenuPage({ id }) {
  const dispatch = useDispatch();
  const { status, data, error } = useSelector(state => state.menu);

  useEffect(() => {
    const promise = dispatch(fetchMenu(id));
    return () => promise.abort();
  }, [dispatch, id]);

  if (status === 'loading' || status === 'idle') return <MenuShimmer />;
  if (status === 'failed') return <p role="alert">{error}</p>;
  return <MenuList categories={data.categories} />;
}`,
          paragraphs: [
            "Model status as one string instead of separate isLoading and isError booleans. A single value cannot be in two states at once, which removes a class of impossible-state bugs.",
          ],
        },
      ],
      animation: {
        title: "Lifecycle of an async thunk",
        nodes: [
          { id: "ui", label: "Component", sub: "dispatch(fetchMenu)" },
          { id: "thunk", label: "Thunk", sub: "async function" },
          { id: "api", label: "API", sub: "/api/menu/42" },
          { id: "slice", label: "menuSlice", sub: "extraReducers" },
          { id: "store", label: "Store", sub: "status + data" },
        ],
        steps: [
          {
            from: "ui",
            to: "thunk",
            label: "dispatch",
            note: "The component dispatches the thunk instead of a plain action.",
          },
          {
            from: "thunk",
            to: "slice",
            label: "pending",
            note: "The pending action sets status to loading so the UI can show a shimmer.",
          },
          {
            from: "thunk",
            to: "api",
            label: "fetch",
            note: "The thunk performs the network request outside any reducer.",
          },
          {
            from: "api",
            to: "thunk",
            label: "JSON",
            note: "The response arrives and the thunk returns the parsed data.",
          },
          {
            from: "thunk",
            to: "slice",
            label: "fulfilled",
            note: "The fulfilled action stores the data and marks status as succeeded.",
          },
          {
            from: "slice",
            to: "store",
            label: "save",
            note: "Selectors see the new status and the component renders the menu.",
          },
        ],
      },
    },
  ),
};
