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
import AsyncStorage from "../AsyncStorageHelper";
import { useNavigate } from 'react-router-dom';

const AddRecipe = () => {
  const navigate = useNavigate();
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
      protein: null,
      carbohydrates: null,
      fat: null,
      fiber: null,
      sugar: null,
      sodium: null
    }
  };

  const [recipe, setRecipe] = useState(initialRecipeState);
  const [recipeImage, setRecipeImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipeImagePreview, setRecipeImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleNavigateRecipesList = () => {
    navigate('/admin/recipes'); // Điều hướng đến màn hình /admin/recipes
  };

  // Handlers remain the same until handleSubmit
  const handleRecipeChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prev => ({
      ...prev,
      [name]: value
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
  };

  const removeStep = (index) => {
    setRecipe(prev => ({
      ...prev,
      steps: prev.steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, step_number: i + 1 }))
    }));
  };

  const handleImageFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setRecipeImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setRecipeImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
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
        vitamins: []
      };

      // Add recipe data as JSON string
      formData.append('recipe_data', JSON.stringify(processedRecipe));

      // Add recipe image if exists
      if (recipeImage) {
        formData.append('image', recipeImage);
      }

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

      // Reset form
      setRecipe(initialRecipeState);
      setRecipeImage(null);
      setRecipeImagePreview(null);
      alert('Recipe added successfully!');
      handleNavigateRecipesList();
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
                          <label className="form-control-label">Category</label>
                          <Input
                            type="select"
                            name="type"
                            value={recipe.type || ""}
                            onChange={handleRecipeChange}
                            style={{ borderRadius: '10px' }}
                          >
                            <option value="">Select Category</option>
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Snack">Snack</option>
                          </Input>
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
                      <Col lg="12">
                        <FormGroup>
                          <label className="form-control-label">Recipe Image</label>
                          <div
                            onDragEnter={onDragEnter}
                            onDragLeave={onDragLeave}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            onClick={() => document.getElementById('recipeImageInput').click()}
                            style={{
                              border: isDragging ? '2px dashed #2dce89' : '2px dashed #e9ecef',
                              borderRadius: '15px',
                              padding: '40px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              backgroundColor: isDragging ? 'rgba(45, 206, 137, 0.05)' : '#f8f9fe',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Input
                              id="recipeImageInput"
                              type="file"
                              onChange={(e) => handleImageFile(e.target.files[0])}
                              accept="image/*"
                              style={{ display: 'none' }}
                            />
                            {recipeImagePreview ? (
                              <div style={{ position: 'relative' }}>
                                <img
                                  src={recipeImagePreview}
                                  alt="Recipe Preview"
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '300px',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
                                  }}
                                />
                                <div style={{ marginTop: '10px', color: '#8898aa', fontSize: '0.875rem' }}>
                                  Click or drag to change image
                                </div>
                              </div>
                            ) : (
                              <div>
                                <i className="fas fa-cloud-upload-alt fa-3x mb-3" style={{ color: '#adb5bd' }}></i>
                                <h4 style={{ color: '#525f7f' }}>Drag and drop your image here</h4>
                                <p className="text-muted mb-0">or click to browse files</p>
                              </div>
                            )}
                          </div>
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
                          <Col lg="5">
                            <FormGroup>
                              <label className="form-control-label">Name</label>
                              <Input
                                type="text"
                                name="name_ingredient"
                                value={ingredient.name_ingredient}
                                onChange={(e) => handleIngredientChange(index, e)}
                                required
                                style={{ borderRadius: '10px' }}
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
                                style={{ borderRadius: '10px' }}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="2">
                            <FormGroup>
                              <label className="form-control-label">Unit</label>
                              <Input
                                type="text"
                                name="unit"
                                value={ingredient.unit}
                                onChange={(e) => handleIngredientChange(index, e)}
                                required
                                style={{ borderRadius: '10px' }}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="2" className="d-flex align-items-center justify-content-end">
                            {index > 0 && (
                              <Button
                                color="danger"
                                size="sm"
                                onClick={() => removeIngredient(index)}
                                style={{ borderRadius: '10px', marginTop: '14px' }}
                              >
                                <i className="fas fa-trash" />
                              </Button>
                            )}
                          </Col>
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
                            min="0"
                            name="calories"
                            value={recipe.nutrition.calories}
                            onChange={handleNutritionChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="3">
                        <FormGroup>
                          <label className="form-control-label">Protein (g)</label>
                          <Input
                            type="number"
                            min="0"
                            name="protein"
                            value={recipe.nutrition.protein}
                            onChange={handleNutritionChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="3">
                        <FormGroup>
                          <label className="form-control-label">Carbohydrates (g)</label>
                          <Input
                            type="number"
                            min="0"
                            name="carbohydrates"
                            value={recipe.nutrition.carbohydrates}
                            onChange={handleNutritionChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="3">
                        <FormGroup>
                          <label className="form-control-label">Fat (g)</label>
                          <Input
                            type="number"
                            min="0"
                            name="fat"
                            value={recipe.nutrition.fat}
                            onChange={handleNutritionChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="3">
                        <FormGroup>
                          <label className="form-control-label">Fiber (g)</label>
                          <Input
                            type="number"
                            min="0"
                            name="fiber"
                            value={recipe.nutrition.fiber}
                            onChange={handleNutritionChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="3">
                        <FormGroup>
                          <label className="form-control-label">Sugar (g)</label>
                          <Input
                            type="number"
                            min="0"
                            name="sugar"
                            value={recipe.nutrition.sugar}
                            onChange={handleNutritionChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="3">
                        <FormGroup>
                          <label className="form-control-label">Sodium (mg)</label>
                          <Input
                            type="number"
                            min="0"
                            name="sodium"
                            value={recipe.nutrition.sodium}
                            onChange={handleNutritionChange}
                            style={{ borderRadius: '10px' }}
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