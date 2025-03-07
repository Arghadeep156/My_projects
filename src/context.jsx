import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'

const AppContext = React.createContext()

const allMealsURL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
const randomMealURL = 'https://www.themealdb.com/api/json/v1/1/random.php';

const getFavoritesFromLocalStorage = () => {
  let favorites = localStorage.getItem('favorites');
  if (favorites) {
    favorites = JSON.parse(localStorage.getItem('favorites'))
  } else {
    favorites = []
  }
  return favorites
}

const AppProvider = ({ children }) => {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [favorites, setFavorites] = useState(getFavoritesFromLocalStorage())

  const fetchMeals = async (url) => {
    setLoading(true)
    try {
      let { data } = await axios.get(url);
      if (data.meals) {
        setMeals(data.meals)
      } else {
        setMeals([])
      }
    } catch (e) {
      console.log(e.response)
    }
    setLoading(false)
  }

  const selectMeal = (idMeal, favoriteMeal) => {
    let meal
    if (favoriteMeal) {
      meal = favorites.find((meal) => meal.idMeal === idMeal)
    } else {
      meal = meals.find((meal) => meal.idMeal === idMeal)
    }
    setSelectedMeal(meal)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const addToFavorites = (idMeal) => {
    const alreadyFavorite = favorites.find((meal) => meal.idMeal === idMeal)
    if (alreadyFavorite) return
    const meal = meals.find((meal) => meal.idMeal === idMeal)
    const updatedFavorites = [...favorites, meal]
    setFavorites(updatedFavorites)
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
  }
  //Logic for removing item from the favorites list - dont included if the clicked MealID matched the mealId in the favorites array.
  const removeFromFavorites = (idMeal) => {
    const updatedFavorites = favorites.filter((meal) => meal.idMeal !== idMeal)
    setFavorites(updatedFavorites)
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
  }

  const fetchRandomMeal = () => {
    fetchMeals(randomMealURL)
  }

  useEffect(() => {
    fetchMeals(allMealsURL)
  }, [])

  useEffect(() => {
    if (!searchTerm) return
    fetchMeals(`${allMealsURL}${searchTerm}`)
  }, [searchTerm])

  return <AppContext.Provider value={{ meals, loading, setSearchTerm, fetchRandomMeal, showModal, selectedMeal, selectMeal, setShowModal, closeModal, favorites, addToFavorites, removeFromFavorites }}>
    {children}
  </AppContext.Provider>
}

AppProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useGlobalContext = () => {
  return useContext(AppContext)
}

export { AppContext, AppProvider } 