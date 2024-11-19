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

const AddRecipe = () => {
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;
  const initialRecipeState = {
    name_recipe: "",
    type: "",
    status: "pending",
    summary: "",
    ingredients: [{ name_ingredient: "", quantity: "", unit: "" }],
    steps: [{ step_number: 1, content: "" }],
    nutrition: {
      calories: "",
      fat: "",
      saturated_fat: "",
      carbohydrates: "",
      sugar: "",
      cholesterol: "",
      sodium: "",
      protein: "",
      alcohol: ""
    },
    vitamins: [{
      protein: "",
      calcium: "",
      iron: "",
      vitamin_a: "",
      vitamin_c: "",
      vitamin_d: "",
      vitamin_e: "",
      vitamin_k: "",
      vitamin_b1: "",
      vitamin_b2: "",
      vitamin_b3: "",
      vitamin_b5: "",
      vitamin_b6: "",
      vitamin_b12: "",
      fiber: ""
    }]
  };

  const [recipe, setRecipe] = useState(initialRecipeState);
  const [recipeImage, setRecipeImage] = useState(null);
  const [ingredientImages, setIngredientImages] = useState([null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      ingredients: [...prev.ingredients, { name_ingredient: "", quantity: "", unit: "" }]
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

        // Chuyển các chuỗi số thành số trong đối tượng công thức
        const processedRecipe = {
            ...recipe,
            ingredients: recipe.ingredients.map(ing => ({
                name_ingredient: ing.name_ingredient,
                quantity: Number(ing.quantity) || 0,
                unit: ing.unit
            })),
            nutrition: Object.entries(recipe.nutrition).reduce((acc, [key, value]) => ({
                ...acc,
                [key]: Number(value) || 0
            }), {}),
            vitamins: recipe.vitamins.map(vitamin =>
                Object.entries(vitamin).reduce((acc, [key, value]) => ({
                    ...acc,
                    [key]: Number(value) || 0
                }), {})
            )
        };

        console.log(JSON.stringify(processedRecipe));

        // Thêm recipe_data như chuỗi JSON
        formData.append('recipe_data', JSON.stringify(processedRecipe));

        // Thêm hình ảnh công thức nếu có chọn
        if (recipeImage) {
            formData.append('image', recipeImage);
        }

        // Thêm hình ảnh nguyên liệu nếu có chọn
        ingredientImages.forEach((image, index) => {
            if (image) {
                formData.append('ingredients_images', image);
            }
        });

        // Gửi yêu cầu đến API
        const response = await fetch(`${apiDomain}/api/recipe/add`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add recipe');
        }

        const responseData = await response.json();
        console.log('Success:', responseData);

        // Đặt lại form
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

  // Rest of the component remains the same (JSX)
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
                            onChange={(e) => setRecipeImage(e.target.files[0])}
                            accept="image/*"
                          />
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
                                onChange={(e) => handleIngredientImageChange(index, e)}
                                accept="image/*"
                              />
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