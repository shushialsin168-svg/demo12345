// ==========================================
// 1. TypeScript Types
// ==========================================

export type Category = {
  id: string;
  nameKh: string;
};

export type Product = {
  id: string;
  nameKh: string;
  categoryId: string;
  price: number;
  image: string;
  tag?: string;
};

export type Option = { 
  id: string; 
  label: string; 
  price: number; 
};

export type OptionGroup = {
  title: string;
  multi: boolean;
  options: Option[];
};


// ==========================================
// 2. Data Constants
// ==========================================

export const categories: Category[] = [
  { id: "all", nameKh: "ទាំងអស់" },
  { id: "tea", nameKh: "គេសជ្ជៈប្រភេទតែ" },
  { id: "coffee", nameKh: "គេសជ្ជៈកាហ្វេ" },
  { id: "ice", nameKh: "គេសជ្ជៈក្រឡុក" },
  { id: "juice", nameKh: "គេសជ្ជៈផ្លែឈើ" },
  { id: "snack", nameKh: "អាហារសម្រន់" },
  { id: "other", nameKh: "ផ្សេងៗ" }, // Added "other" Category
];

// Products are managed entirely from the Admin page (stored in the database).
// This static list is intentionally empty.
export const products: Product[] = [];

export const optionGroups: OptionGroup[] = [
  {
    title: "បន្ថែម",
    multi: true,
    options: [
      { id: "add-honey-pearl", label: "គុជទឹកឃ្មុំ", price: 1500 },
      { id: "add-cream", label: "គ្រីម Cream", price: 1500 },
      { id: "add-cream-sweet", label: "គ្រីមផ្អែម", price: 1500 },
      { id: "add-cream-salty", label: "គ្រីមប្រៃ", price: 1500 },
      { id: "add-cream-cheese", label: "គ្រីមឈីស", price: 1500 },
      { id: "add-cream-chocolate", label: "គ្រីមសូកូឡា", price: 1500 },
      { id: "add-cream-vanilla", label: "គ្រីមវ៉ានីឡា", price: 2500 },
      { id: "add-cream-blueberry", label: "គ្រីមប្លូប៊ឺរី", price: 2500 },
      { id: "add-cream-coffee", label: "គ្រីមកាហ្វេ", price: 2500 },
      { id: "add-cream-yogurt", label: "គ្រីមយ៉ាអួ", price: 2500 },
      { id: "add-cream-pineapple", label: "គ្រីមម្នាស់", price: 2500 },
      { id: "add-cream-strawberry", label: "គ្រីមស្ត្រូប៊ឺរី", price: 2500 },
    ],
  },
  {
    title: "សម្រាប់កាហ្វេ",
    multi: true,
    options: [
      { id: "cf-sugar-syrup", label: "ទឹកស្ករ", price: 0 },
      { id: "cf-vanilla", label: "ទឹកវ៉ានីឡា", price: 500 },
      { id: "cf-condensed-milk", label: "ទឹកដោះគោខាប់", price: 0 },
      { id: "cf-salted-caramel", label: "ទឹកខារ៉ាមែលប្រៃ", price: 500 },
      { id: "cf-hazelnut", label: "ទឹក Hazelnut", price: 500 },
    ],
  },
  {
    title: "កម្រិតស្ករ",
    multi: false,
    options: [
      { id: "s0", label: "ស្ករ 0% (0ml)", price: 0 },
      { id: "s25", label: "ស្ករ 25% (10ml)", price: 0 },
      { id: "s50", label: "ស្ករ 50% (20ml)", price: 0 },
      { id: "s75", label: "ស្ករ 75% (30ml)", price: 0 },
      { id: "s100", label: "ស្ករ 100% (40ml)", price: 0 },
    ],
  },
  {
    title: "កម្រិតទឹកកក",
    multi: false,
    options: [
      { id: "ice-thick", label: "ទឹកកកក្រាស់", price: 0 },
      { id: "ice-more", label: "ទឹកកកច្រើន", price: 0 },
      { id: "ice-less", label: "ទឹកកកតិច", price: 0 },
      { id: "ice-normal", label: "ទឹកកកធម្មតា", price: 0 },
    ],
  },
];


// ==========================================
// 3. Helper Functions
// ==========================================

export const formatPrice = (n: number): string =>
  `៛ ${n.toLocaleString("en-US")}`;

/**
 * Returns available option groups for a given category.
 * - Returns an empty array `[]` for "other" or "snack" categories to completely block and hide options.
 * - Hides coffee-specific options ("សម្រាប់កាហ្វេ") for any category other than "coffee".
 */
export const getAvailableOptionGroups = (categoryId: string): OptionGroup[] => {
  // Completely block all customization options for snacks and others
  const blockedCategories = ["other", "snack"];
  if (blockedCategories.includes(categoryId)) {
    return [];
  }

  // Filter groups dynamically
  return optionGroups.filter((group) => {
    if (group.title === "សម្រាប់កាហ្វេ") {
      return categoryId === "coffee";
    }
    return true;
  });
};
