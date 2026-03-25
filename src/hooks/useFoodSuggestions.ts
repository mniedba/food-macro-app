import { useMemo } from 'react';
import { MacroTargets, FoodItem, Recipe } from '../types';
import { foods } from '../data/foods';
import { recipes } from '../data/recipes';

export function useFoodSuggestions(
  macroTargets: MacroTargets | null,
  filter: string | null
) {
  const sortedFoods = useMemo(() => {
    if (!macroTargets) return foods;
    const { goalType } = macroTargets;

    return [...foods]
      .map((item) => {
        let score = 0;
        if (goalType === 'cut') {
          score += item.calories > 0 ? (item.proteinG / item.calories) * 100 : 0;
        }
        if (goalType === 'bulk') {
          score += item.calories / 100;
        }
        if (filter && item.tags.includes(filter)) {
          score += 10;
        }
        return { ...item, _score: score };
      })
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...item }) => item as FoodItem);
  }, [macroTargets, filter]);

  const sortedRecipes = useMemo(() => {
    if (!macroTargets) return recipes;
    const { goalType } = macroTargets;

    return [...recipes]
      .map((item) => {
        let score = 0;
        if (goalType === 'cut') {
          score += item.totalCalories > 0 ? (item.totalProteinG / item.totalCalories) * 100 : 0;
        }
        if (item.goalAlignment.includes(goalType)) {
          score += 20;
        }
        if (filter && item.tags.includes(filter)) {
          score += 10;
        }
        if (goalType === 'bulk') {
          score += item.totalCalories / 100;
        }
        return { ...item, _score: score };
      })
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...item }) => item as Recipe);
  }, [macroTargets, filter]);

  return { foods: sortedFoods, recipes: sortedRecipes };
}
