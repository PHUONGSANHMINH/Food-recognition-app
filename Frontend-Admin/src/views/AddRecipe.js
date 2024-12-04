import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
} from "reactstrap";
import React, { useState } from "react";
import HeaderAddRecipe from "components/Headers/HeaderAddRecipe.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddRecipe = () => {
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;
  const initialRecipeState = {
    name_recipe: null,
    type: null,
    status: "pending",
    summary: null,
    ingredients: [{ name_ingredient: null, quantity: null, unit: null }],
    steps: [{ step_number: 1, content: null }],
    nutrition: {
      calories: null,
      fat: null,
      saturated_fat: null,
      carbohydrates: null,
      sugar: null,
      cholesterol: null,
      sodium: null,
      protein: null,
      alcohol: null
    },
    vitamins: [{
      protein: null,
      calcium: null,
      iron: null,
      vitamin_a: null,
      vitamin_c: null,
      vitamin_d: null,
      vitamin_e: null,
      vitamin_k: null,
      vitamin_b1: null,
      vitamin_b2: null,
      vitamin_b3: null,
      vitamin_b5: null,
      vitamin_b6: null,
      vitamin_b12: null,
      fiber: null
    }]
  };

  const [recipe, setRecipe] = useState(initialRecipeState);
  const [recipeImage, setRecipeImage] = useState(null);
  const [ingredientImages, setIngredientImages] = useState([null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipeImagePreview, setRecipeImagePreview] = useState(null);


  // Handlers remain the same until handleSubmit
  const handleRecipeChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVitaminChange = (index, e) => {
    const { name, value } = e.target;
    const newVitamins = [...recipe.vitamins];
    newVitamins[index] = {
      ...newVitamins[index],
      [name]: value
    };
    setRecipe(prev => ({
      ...prev,
      vitamins: newVitamins
    }));
  };

  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [name]: value
      }
    }));
  };

  const handleIngredientChange = (index, e) => {
    const { name, value } = e.target;
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [name]: value
    };
    setRecipe(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const handleStepChange = (index, e) => {
    const { name, value } = e.target;
    const newSteps = [...recipe.steps];
    newSteps[index] = {
      ...newSteps[index],
      [name]: value
    };
    setRecipe(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name_ingredient: null, quantity: null, unit: null }]
    }));
    setIngredientImages(prev => [...prev, null]);
  };

  const addStep = () => {
    setRecipe(prev => ({
      ...prev,
      steps: [...prev.steps, { step_number: prev.steps.length + 1, content: "" }]
    }));
  };

  const removeIngredient = (index) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
    setIngredientImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeStep = (index) => {
    setRecipe(prev => ({
      ...prev,
      steps: prev.steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, step_number: i + 1 }))
    }));
  };

  const handleIngredientImageChange = (index, e) => {
    const newIngredientImages = [...ingredientImages];
    newIngredientImages[index] = e.target.files[0];
    setIngredientImages(newIngredientImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      // Process recipe data
      const processedRecipe = {
        ...recipe,
        ingredients: recipe.ingredients.map(ing => ({
          name_ingredient: ing.name_ingredient,
          quantity: parseFloat(ing.quantity) || 0,
          unit: ing.unit
        })),
        nutrition: Object.entries(recipe.nutrition).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: parseFloat(value) || 0
        }), {}),
        vitamins: recipe.vitamins.map(vitamin =>
          Object.entries(vitamin).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: parseFloat(value) || 0
          }), {})
        )
      };

      // Add recipe data as JSON string
      formData.append('recipe_data', JSON.stringify(processedRecipe));

      // Add recipe image if exists
      if (recipeImage) {
        formData.append('image', recipeImage);
      }

      // Add ingredient images if they exist
      ingredientImages.forEach((image, index) => {
        if (image) {
          formData.append('ingredients_images', image);
        }
      });

      // Send request to API
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${apiDomain}/api/recipe/add`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add recipe');
      }

      const responseData = await response.json();
      console.log('Success:', responseData);

      // Reset form
      setRecipe(initialRecipeState);
      setRecipeImage(null);
      setIngredientImages([null]);
      alert('Recipe added successfully!');

    } catch (error) {
      console.error('Error adding recipe:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // JSX remains largely the same, but add loading state to submit button
  return (
    <>
      <HeaderAddRecipe />
      <Container className="mt--7" fluid>
        <Row>
          <Col className="order-xl-1" xl="12">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">Add New Recipe</h3>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Basic Recipe Information */}
                  <h6 className="heading-small text-muted mb-4">Recipe Information</h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">Recipe Name</label>
                          <Input
                            type="text"
                            name="name_recipe"
                            value={recipe.name_recipe}
                            onChange={handleRecipeChange}
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">Type</label>
                          <Input
                            type="text"
                            name="type"
                            value={recipe.type}
                            onChange={handleRecipeChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="12">
                        <FormGroup>
                          <label className="form-control-label">Summary</label>
                          <Input
                            type="textarea"
                            name="summary"
                            value={recipe.summary}
                            onChange={handleRecipeChange}
                            rows="3"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">Recipe Image</label>
                          <Input
                            type="file"
                            onChange={(e) => {
                              setRecipeImage(e.target.files[0]);
                              const reader = new FileReader();
                              reader.onload = () => {
                                setRecipeImagePreview(reader.result);
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }}
                            accept="image/*"
                          />
                          {recipeImagePreview && (
                            <img src={recipeImagePreview} alt="Recipe Preview" style={{ width: '100%', marginTop: '10px' }} />
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>

                  {/* Ingredients Section */}
                  <hr className="my-4" />
                  <h6 className="heading-small text-muted mb-4">Ingredients</h6>
                  <div className="pl-lg-4">
                    {recipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="mb-3">
                        <Row>
                          <Col lg="4">
                            <FormGroup>
                              <label className="form-control-label">Name</label>
                              <Input
                                type="text"
                                name="name_ingredient"
                                value={ingredient.name_ingredient}
                                onChange={(e) => handleIngredientChange(index, e)}
                                required
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="3">
                            <FormGroup>
                              <label className="form-control-label">Quantity</label>
                              <Input
                                type="number"
                                name="quantity"
                                value={ingredient.quantity}
                                onChange={(e) => handleIngredientChange(index, e)}
                                required
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="3">
                            <FormGroup>
                              <label className="form-control-label">Unit</label>
                              <Input
                                type="text"
                                name="unit"
                                value={ingredient.unit}
                                onChange={(e) => handleIngredientChange(index, e)}
                                required
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="2">
                            <FormGroup>
                              <label className="form-control-label">Image</label>
                              <Input
                                type="file"
                                onChange={(e) => {
                                  handleIngredientImageChange(index, e);
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    const newIngredientImages = [...ingredientImages];
                                    newIngredientImages[index] = reader.result;
                                    setIngredientImages(newIngredientImages);
                                  };
                                  reader.readAsDataURL(e.target.files[0]);
                                }}
                                accept="image/*"
                              />
                              {ingredientImages[index] && (
                                <img src={ingredientImages[index]} alt={`Ingredient Preview ${index}`} style={{ width: '100%', marginTop: '10px' }} />
                              )}
                            </FormGroup>
                          </Col>
                          {index > 0 && (
                            <Col lg="2" className="d-flex align-items-center">
                              <Button
                                color="danger"
                                size="sm"
                                onClick={() => removeIngredient(index)}
                              >
                                Delete
                              </Button>
                            </Col>
                          )}
                        </Row>
                      </div>
                    ))}
                    <Button
                      color="primary"
                      onClick={addIngredient}
                      size="sm"
                      className="mt-3"
                    >
                      Add Ingredient
                    </Button>
                  </div>

                  {/* Steps Section */}
                  <hr className="my-4" />
                  <h6 className="heading-small text-muted mb-4">Recipe Steps</h6>
                  <div className="pl-lg-4">
                    {recipe.steps.map((step, index) => (
                      <Row key={index} className="mb-3">
                        <Col lg="10">
                          <FormGroup>
                            <label className="form-control-label">Step {step.step_number}</label>
                            <Input
                              type="textarea"
                              name="content"
                              value={step.content}
                              onChange={(e) => handleStepChange(index, e)}
                              rows="2"
                              required
                            />
                          </FormGroup>
                        </Col>
                        {index > 0 && (
                          <Col lg="2" className="d-flex align-items-center">
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => removeStep(index)}
                            >
                              Delete
                            </Button>
                          </Col>
                        )}
                      </Row>
                    ))}
                    <Button
                      color="primary"
                      onClick={addStep}
                      size="sm"
                      className="mt-3"
                    >
                      Add Step
                    </Button>
                  </div>

                  {/* Nutrition Section */}
                  <hr className="my-4" />
                  <h6 className="heading-small text-muted mb-4">Nutrition Information</h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="3">
                        <FormGroup>
                          <label className="form-control-label">Calories</label>
                          <Input
                            type="number"
                            name="calories"
                            value={recipe.nutrition.calories}
                            onChange={handleNutritionChange}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="3">
                        <FormGroup>
                          <label className="form-control-label">Fat (g)</label>
                          <Input
                            type="number"
                            name="fat"
                            value={recipe.nutrition.fat}
                            onChange={handleNutritionChange}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="3">
                        <FormGroup>
                          <label className="form-control-label">Saturated Fat (g)</label>
                          <Input
                            type="number"
                            name="saturated_fat"
                            value={recipe.nutrition.saturated_fat}
                            onChange={handleNutritionChange}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="3">
                        <FormGroup>
                          <label className="form-control-label">Carbohydrates (g)</label>
                          <Input
                            type="number"
                            name="carbohydrates"
                            value={recipe.nutrition.carbohydrates}
                            onChange={handleNutritionChange}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="3">
                        <FormGroup>
                          <label className="form-control-label">Protein (g)</label>
                          <Input
                            type="number"
                            name="protein"
                            value={recipe.nutrition.protein}
                            onChange={handleNutritionChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>

                  <div className="pl-lg-4 mt-4">
                    <Button
                      color="primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Recipe'}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AddRecipe;