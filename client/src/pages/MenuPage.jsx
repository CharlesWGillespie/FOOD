import React, { useState, useEffect } from 'react';
import NavBar from "../components/Nav";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MenuItemCard from "../components/Menu-Item";
import CategoryNav from "../components/CategoryNav";
// import menuData from "../../../server/seeders/menuSeeds.json";
import AddCategoryForm from '../components/AddCategoryForm';
import AddMenuItemForm from '../components/AddMenuItemForm';

import { useQuery } from '@apollo/client';
import { useStoreContext } from '../utils/GlobalState';
import { UPDATE_MENUITEMS } from '../utils/actions';
import { QUERY_MENUITEMS, QUERY_CATEGORIES } from '../utils/queries';
import { ADD_CATEGORY, ADD_MENUITEM } from '../utils/mutations'
import { useMutation } from '@apollo/client';
export default function MenuPage() {

  const [showMenuItemForm, setShowMenuItemForm] = useState({}); // State to control visibility of menu item form for each category

  const [state, dispatch] = useStoreContext()
  const [addCategory] = useMutation(ADD_CATEGORY, {
    refetchQueries: [
      QUERY_CATEGORIES, // DocumentNode object parsed with gql
      'GetCategories' // Query name
    ],
  })
  const [addMenuItem] = useMutation(ADD_MENUITEM, {
    refetchQueries: [
      QUERY_MENUITEMS,
      'GetMenuItems'
    ]
  })

  const { loading, data: menuItemData } = useQuery(QUERY_MENUITEMS)

  useEffect(() => {
    if (menuItemData) {
      dispatch({
        type: UPDATE_MENUITEMS,
        menuItems: menuItemData.menuItems
      })
    }
  }, [menuItemData, loading, dispatch])



  const [cartItems, setCartItems] = useState([]);

  // const addToCart = (item) => {
  //   // console.log("Adding item to cart:", item);
  //   setCartItems([...cartItems, item]);
  // };
  // console.log("Current cart items:", cartItems);



  const onCategorySubmit = async (category) => {
    const mutationResponse = await addCategory({ variables: { categoryName: category } })
  };
  
  const handleToggleMenuItemForm = (category) => {
    setShowMenuItemForm(prevState => ({
      ...prevState,
      [category]: !prevState[category] // Toggle the visibility of form for a specific category
    }));
  };
  
  const categories = state.categories
  const menuItems = state.menuItems
  
  const menuItemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.categoryId]) {
      acc[item.categoryId] = [];
    }
    acc[item.categoryId].push(item);
    return acc;
  }, {});
  
  const handleScrollToCategory = (category) => {
    const element = document.getElementById(category);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddMenuItem = async (menuItemWithCategoryId) => {
    
    const mutationResponse = await addMenuItem({variables: menuItemWithCategoryId})
    console.log('New menu item:', menuItemWithCategoryId);
    
    setShowMenuItemForm(prevState => ({
      ...prevState,
      [menuItemWithCategoryId.categoryId]: false // Hide the form after submission
    }));
  };

  return (
    <>
      <NavBar />
      <Container style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ marginTop: '100px', width: '100%' }}>
          <CategoryNav categories={categories} scrollToCategory={handleScrollToCategory} />

          {categories.map((category) => (
            <div key={category._id} id={category.categoryName} style={{ marginBottom: '20px' }}>
              <h2>{category.categoryName}</h2>
              <Grid container spacing={2}>
                {menuItemsByCategory[category._id]?.map((item, index) => (
                  <Grid item xs={6} sm={4} md={3} lg={3} key={index}>
                    <MenuItemCard
                      name={item.foodName}
                      description={item.description}
                      price={item.price}
                      imageUrl={item.foodPicture}
                    // addToCart={addToCart}
                    />
                  </Grid>
                ))}
              </Grid>
              {/* Toggle button to show/hide add menu item form */}
              <button onClick={() => handleToggleMenuItemForm(category)}>Add Menu Item</button>
              {/* Render the menu item form if showMenuItemForm is true for this category */}
              {showMenuItemForm[category] && <AddMenuItemForm categoryId={category._id} onSubmit={handleAddMenuItem} />}
            </div>
          ))}
        </div>
        <AddCategoryForm onCategorySubmit={onCategorySubmit} />
      </Container>
    </>
  );
}
