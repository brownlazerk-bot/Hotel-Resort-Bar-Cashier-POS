import React, { useState } from 'react';
import { MenuItem, KitchenIngredient, RecipeIngredient, KitchenIngredientCategory } from '../types';
import { formatCurrency } from '../lib/currency';
import { 
  Utensils, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, 
  XCircle, Package, Scale, Layers, ChefHat, Search, Filter, RefreshCw, Info, DollarSign, Calculator
} from 'lucide-react';

interface KitchenRecipeManagerProps {
  menuItems: MenuItem[];
  ingredients: KitchenIngredient[];
  onSaveIngredients: (ingredients: KitchenIngredient[]) => void;
  onSaveRecipe: (menuItemId: string, recipe: RecipeIngredient[]) => void;
  darkMode?: boolean;
}

const INGREDIENT_CATEGORIES: KitchenIngredientCategory[] = [
  'Meat & Poultry',
  'Grains & Rice',
  'Vegetables & Produce',
  'Spices & Oils',
  'Dairy & Eggs',
  'Seafood',
  'Beverage Raw Materials',
  'Other Raw Materials'
];

export const KitchenRecipeManager: React.FC<KitchenRecipeManagerProps> = ({
  menuItems,
  ingredients,
  onSaveIngredients,
  onSaveRecipe,
  darkMode = true
}) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'recipes'>('recipes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Ingredient Modal State
  const [showIngModal, setShowIngModal] = useState(false);
  const [editingIngId, setEditingIngId] = useState<string | null>(null);
  const [ingName, setIngName] = useState('');
  const [ingCategory, setIngCategory] = useState<KitchenIngredientCategory>('Meat & Poultry');
  const [ingStockQty, setIngStockQty] = useState<number>(10);
  const [ingUnit, setIngUnit] = useState('Kg');
  const [ingCostPerUnit, setIngCostPerUnit] = useState<number>(2500);
  const [ingMinAlert, setIngMinAlert] = useState<number>(5);
  const [ingSupplier, setIngSupplier] = useState('');
  const [ingNotes, setIngNotes] = useState('');

  // Recipe Modal State
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [recipeDraft, setRecipeDraft] = useState<RecipeIngredient[]>([]);

  // Filtered Kitchen Menu Items
  const kitchenMenuItems = menuItems.filter(m => 
    m.category === 'Kitchen' || 
    m.category === 'Food' || 
    m.category === 'Grill / Barbecue' ||
    m.category === 'Pool Snacks' ||
    m.isKitchenItem ||
    (!m.category.includes('Beverage') && !m.category.includes('Bar') && !m.category.includes('Beer') && !m.category.includes('Liquor'))
  );

  const filteredKitchenDishes = kitchenMenuItems.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ing.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || ing.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate Max Portions for a menu item
  const calculateMaxPortions = (item: MenuItem) => {
    if (!item.hasRecipe || !item.recipe || item.recipe.length === 0) {
      return { portions: item.stockQuantity, bottleneck: 'Direct Stock' };
    }

    let minPortions = Infinity;
    let bottleneck = 'None';

    for (const rItem of item.recipe) {
      const ing = ingredients.find(g => g.id === rItem.ingredientId || g.name.toLowerCase() === rItem.ingredientName.toLowerCase());
      if (!ing || ing.stockQuantity <= 0 || rItem.quantity <= 0) {
        return { portions: 0, bottleneck: rItem.ingredientName };
      }
      const possible = Math.floor(ing.stockQuantity / rItem.quantity);
      if (possible < minPortions) {
        minPortions = possible;
        bottleneck = ing.name;
      }
    }

    return { portions: minPortions === Infinity ? 0 : minPortions, bottleneck };
  };

  // Calculate Food Cost for a Recipe
  const calculateRecipeCost = (recipe: RecipeIngredient[]) => {
    return recipe.reduce((acc, rItem) => {
      const ing = ingredients.find(g => g.id === rItem.ingredientId || g.name.toLowerCase() === rItem.ingredientName.toLowerCase());
      const cost = rItem.costPerUnit || ing?.costPerUnit || 0;
      return acc + (rItem.quantity * cost);
    }, 0);
  };

  // Open Ingredient Modal (Create or Edit)
  const openIngModal = (ing?: KitchenIngredient) => {
    if (ing) {
      setEditingIngId(ing.id);
      setIngName(ing.name);
      setIngCategory(ing.category);
      setIngStockQty(ing.stockQuantity);
      setIngUnit(ing.unit);
      setIngCostPerUnit(ing.costPerUnit);
      setIngMinAlert(ing.minStockAlert);
      setIngSupplier(ing.supplier || '');
      setIngNotes(ing.notes || '');
    } else {
      setEditingIngId(null);
      setIngName('');
      setIngCategory('Meat & Poultry');
      setIngStockQty(10);
      setIngUnit('Kg');
      setIngCostPerUnit(3000);
      setIngMinAlert(5);
      setIngSupplier('');
      setIngNotes('');
    }
    setShowIngModal(true);
  };

  // Handle Save Raw Ingredient
  const handleSaveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingName.trim()) {
      alert('Please enter ingredient name');
      return;
    }

    const isOut = ingStockQty <= 0;
    const isLow = !isOut && ingStockQty <= ingMinAlert;
    const status = isOut ? 'Out of Stock' : (isLow ? 'Low Stock' : 'Available');

    let updatedList: KitchenIngredient[];

    if (editingIngId) {
      updatedList = ingredients.map(ing => ing.id === editingIngId ? {
        ...ing,
        name: ingName.trim(),
        category: ingCategory,
        stockQuantity: Number(ingStockQty),
        unit: ingUnit,
        costPerUnit: Number(ingCostPerUnit),
        minStockAlert: Number(ingMinAlert),
        status,
        supplier: ingSupplier.trim(),
        notes: ingNotes.trim(),
        lastRestocked: new Date().toISOString()
      } : ing);
    } else {
      const newIng: KitchenIngredient = {
        id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: ingName.trim(),
        category: ingCategory,
        stockQuantity: Number(ingStockQty),
        unit: ingUnit,
        costPerUnit: Number(ingCostPerUnit),
        minStockAlert: Number(ingMinAlert),
        status,
        supplier: ingSupplier.trim(),
        notes: ingNotes.trim(),
        lastRestocked: new Date().toISOString()
      };
      updatedList = [newIng, ...ingredients];
    }

    onSaveIngredients(updatedList);
    setShowIngModal(false);
  };

  // Handle Delete Ingredient
  const handleDeleteIngredient = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete raw ingredient "${name}"?`)) {
      const updated = ingredients.filter(g => g.id !== id);
      onSaveIngredients(updated);
    }
  };

  // Open Recipe Builder Modal
  const openRecipeModal = (item: MenuItem) => {
    setSelectedMenuItem(item);
    if (item.recipe && item.recipe.length > 0) {
      setRecipeDraft([...item.recipe]);
    } else {
      // Provide default template draft with 1 sample line if ingredients exist
      if (ingredients.length > 0) {
        setRecipeDraft([{
          ingredientId: ingredients[0].id,
          ingredientName: ingredients[0].name,
          quantity: 0.2,
          unit: ingredients[0].unit,
          costPerUnit: ingredients[0].costPerUnit
        }]);
      } else {
        setRecipeDraft([]);
      }
    }
    setShowRecipeModal(true);
  };

  // Add Ingredient Row to Draft Recipe
  const addRecipeRow = () => {
    if (ingredients.length === 0) {
      alert('Please create raw ingredients first in the Raw Ingredients tab!');
      return;
    }
    const first = ingredients[0];
    setRecipeDraft(prev => [
      ...prev,
      {
        ingredientId: first.id,
        ingredientName: first.name,
        quantity: 0.1,
        unit: first.unit,
        costPerUnit: first.costPerUnit
      }
    ]);
  };

  // Remove Row from Draft Recipe
  const removeRecipeRow = (index: number) => {
    setRecipeDraft(prev => prev.filter((_, i) => i !== index));
  };

  // Update Row in Draft Recipe
  const updateRecipeRow = (index: number, field: keyof RecipeIngredient, value: any) => {
    setRecipeDraft(prev => {
      const next = [...prev];
      if (field === 'ingredientId') {
        const found = ingredients.find(g => g.id === value);
        if (found) {
          next[index] = {
            ...next[index],
            ingredientId: found.id,
            ingredientName: found.name,
            unit: found.unit,
            costPerUnit: found.costPerUnit
          };
        }
      } else {
        next[index] = {
          ...next[index],
          [field]: value
        };
      }
      return next;
    });
  };

  // Save Dish Recipe
  const handleSaveRecipeDraft = () => {
    if (!selectedMenuItem) return;

    // Filter valid rows
    const validRows = recipeDraft.filter(r => r.ingredientId && r.quantity > 0);
    onSaveRecipe(selectedMenuItem.id, validRows);
    setShowRecipeModal(false);
    alert(`Recipe formula for "${selectedMenuItem.name}" saved successfully! Order sales will now automatically deduct constituent ingredients from kitchen store.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-emerald-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl font-black">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Kitchen Recipe & Ingredient Management
                <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Automated BOM Stock
                </span>
              </h2>
              <p className="text-xs text-emerald-200/80 mt-1">
                Configure dish recipes (e.g., Chicken Rice = 0.25kg Chicken + 0.2kg Rice). Ordering dishes automatically deducts raw store ingredients in real-time!
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openIngModal()}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Raw Ingredient</span>
          </button>
        </div>
      </div>

      {/* Tabs Selection & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'recipes'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Dish Recipes & Bill of Materials ({kitchenMenuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'ingredients'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Raw Kitchen Store Ingredients ({ingredients.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search recipes or raw ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          {activeTab === 'ingredients' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              {INGREDIENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* VIEW 1: DISH RECIPES & BILL OF MATERIALS */}
      {activeTab === 'recipes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKitchenDishes.map(dish => {
              const { portions, bottleneck } = calculateMaxPortions(dish);
              const recipeCost = calculateRecipeCost(dish.recipe || []);
              const grossProfit = dish.price - recipeCost;
              const marginPct = dish.price > 0 ? Math.round((grossProfit / dish.price) * 100) : 0;

              return (
                <div 
                  key={dish.id} 
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 space-y-4 transition-all shadow-md hover:shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{dish.name}</span>
                          {dish.hasRecipe && dish.recipe && dish.recipe.length > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Recipe Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              No Recipe
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{dish.category} • Selling Price: <strong className="text-amber-400">{formatCurrency(dish.price)}</strong></p>
                      </div>

                      <button
                        onClick={() => openRecipeModal(dish)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center space-x-1 shrink-0 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{dish.hasRecipe ? 'Edit Recipe' : '+ Build Recipe'}</span>
                      </button>
                    </div>

                    {/* Recipe Breakdown List */}
                    {dish.hasRecipe && dish.recipe && dish.recipe.length > 0 ? (
                      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex justify-between">
                          <span>Constituent Ingredients</span>
                          <span>Qty / Serving</span>
                        </p>
                        <div className="space-y-1 text-xs">
                          {dish.recipe.map((r, i) => {
                            const ing = ingredients.find(g => g.id === r.ingredientId || g.name.toLowerCase() === r.ingredientName.toLowerCase());
                            const isIngOut = !ing || ing.stockQuantity <= 0;
                            return (
                              <div key={i} className="flex justify-between items-center text-slate-300 py-0.5 border-b border-slate-800/50 last:border-none">
                                <span className="flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isIngOut ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`}></span>
                                  <span>{r.ingredientName}</span>
                                </span>
                                <span className="font-mono text-amber-300 font-semibold">{r.quantity} {r.unit}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
                        <Info className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                        Click "Build Recipe" to assign raw ingredients like chicken, rice, oil, spices.
                      </div>
                    )}
                  </div>

                  {/* Financial & Max Production Calculations */}
                  <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Food Cost / Serving</p>
                      <p className="font-black text-emerald-400 text-sm mt-0.5">{formatCurrency(recipeCost)}</p>
                      <p className="text-[10px] text-slate-400">Margin: <span className="text-amber-300 font-bold">{marginPct}%</span></p>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Raw Stock Capacity</p>
                      <p className={`font-black text-sm mt-0.5 ${portions <= 5 ? 'text-rose-400' : 'text-cyan-400'}`}>
                        {portions} Portions
                      </p>
                      {portions <= 5 && bottleneck !== 'None' && (
                        <p className="text-[9px] text-rose-300 truncate">Limiting: {bottleneck}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: RAW KITCHEN INGREDIENTS TABLE */}
      {activeTab === 'ingredients' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Ingredient Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Current Raw Stock</th>
                  <th className="p-4">Unit Cost</th>
                  <th className="p-4">Min Alert Threshold</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredIngredients.map(ing => {
                  const isOut = ing.stockQuantity <= 0;
                  const isLow = !isOut && ing.stockQuantity <= ing.minStockAlert;

                  return (
                    <tr key={ing.id} className="hover:bg-slate-800/50 transition-all">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <Package className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <p>{ing.name}</p>
                          {ing.supplier && <p className="text-[10px] text-slate-400">Supplier: {ing.supplier}</p>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-slate-800 text-slate-300 font-bold border border-slate-700">
                          {ing.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-amber-300 text-sm">
                        {ing.stockQuantity} {ing.unit}
                      </td>
                      <td className="p-4 font-mono text-emerald-400 font-bold">
                        {formatCurrency(ing.costPerUnit)} / {ing.unit}
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {ing.minStockAlert} {ing.unit}
                      </td>
                      <td className="p-4">
                        {isOut ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> Low Stock Alert
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> In Stock
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openIngModal(ing)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteIngredient(ing.id, ing.name)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/30 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT RAW INGREDIENT */}
      {showIngModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                {editingIngId ? 'Edit Raw Ingredient' : 'Create New Raw Ingredient'}
              </h3>
              <button onClick={() => setShowIngModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleSaveIngredient} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Ingredient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicken Meat, White Rice, Vegetable Oil, Beef..."
                  value={ingName}
                  onChange={(e) => setIngName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <select
                    value={ingCategory}
                    onChange={(e) => setIngCategory(e.target.value as KitchenIngredientCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500"
                  >
                    {INGREDIENT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Measuring Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kg, Liters, Grams, Pieces..."
                    value={ingUnit}
                    onChange={(e) => setIngUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Initial Stock Qty</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={ingStockQty}
                    onChange={(e) => setIngStockQty(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 font-bold focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Cost Per Unit (RWF)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={ingCostPerUnit}
                    onChange={(e) => setIngCostPerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-bold focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Min Low Stock Alert</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={ingMinAlert}
                    onChange={(e) => setIngMinAlert(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-rose-300 font-bold focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Supplier / Origin (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Nyabugogo Market, Local Farm..."
                  value={ingSupplier}
                  onChange={(e) => setIngSupplier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowIngModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20"
                >
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT DISH RECIPE (BUILDER) */}
      {showRecipeModal && selectedMenuItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-amber-400" />
                  Configure Recipe Formula for "{selectedMenuItem.name}"
                </h3>
                <p className="text-xs text-slate-400">
                  Dish Selling Price: <strong className="text-amber-400">{formatCurrency(selectedMenuItem.price)}</strong>
                </p>
              </div>
              <button onClick={() => setShowRecipeModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-300">Constituent Ingredients Breakdown</span>
                <button
                  onClick={addRecipeRow}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Ingredient Row</span>
                </button>
              </div>

              {recipeDraft.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                  No ingredients added yet. Click "+ Add Ingredient Row" above.
                </div>
              ) : (
                <div className="space-y-3">
                  {recipeDraft.map((row, idx) => {
                    const ing = ingredients.find(g => g.id === row.ingredientId);
                    const rowCost = row.quantity * (ing?.costPerUnit || row.costPerUnit || 0);

                    return (
                      <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 w-full sm:w-auto">
                          <label className="block text-[10px] text-slate-400 font-bold mb-1">Raw Ingredient</label>
                          <select
                            value={row.ingredientId}
                            onChange={(e) => updateRecipeRow(idx, 'ingredientId', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500"
                          >
                            {ingredients.map(g => (
                              <option key={g.id} value={g.id}>
                                {g.name} ({g.stockQuantity} {g.unit} in store)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-32">
                          <label className="block text-[10px] text-slate-400 font-bold mb-1">Qty / Serving ({row.unit || 'Kg'})</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.001"
                            value={row.quantity}
                            onChange={(e) => updateRecipeRow(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-amber-300 font-bold focus:border-amber-500"
                          />
                        </div>

                        <div className="w-full sm:w-28 text-right">
                          <label className="block text-[10px] text-slate-400 font-bold mb-1">Cost / Portion</label>
                          <span className="font-mono text-emerald-400 font-bold">{formatCurrency(rowCost)}</span>
                        </div>

                        <button
                          onClick={() => removeRecipeRow(idx)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recipe Cost Calculation Summary */}
              {recipeDraft.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 rounded-2xl border border-emerald-500/30 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Food Cost</p>
                    <p className="font-black text-emerald-400 text-sm">{formatCurrency(calculateRecipeCost(recipeDraft))}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Selling Price</p>
                    <p className="font-black text-amber-400 text-sm">{formatCurrency(selectedMenuItem.price)}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Estimated Profit Margin</p>
                    <p className="font-black text-cyan-300 text-sm">
                      {selectedMenuItem.price > 0 ? Math.round(((selectedMenuItem.price - calculateRecipeCost(recipeDraft)) / selectedMenuItem.price) * 100) : 0}%
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRecipeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRecipeDraft}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20"
                >
                  Save Recipe Formula
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
