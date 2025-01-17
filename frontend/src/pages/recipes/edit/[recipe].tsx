import { FormEvent, useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { Api, ApiResponse, isClientSide } from "../../../api/Api";
import { EditRecipe } from "../../../api/EditRecipe";
import {
  LOGIN_ENDPOINT,
  RECIPES_BASE_ENDPOINT,
  ROOT_ENDPOINT,
} from "../../../api/Endpoints";
import { Image } from "../../../api/Image";
import {
  EditableIngredient,
  ingredientsFromEditable,
  ingredientsToEditable,
} from "../../../api/Ingredient";
import { Recipe } from "../../../api/Recipe";
import { Step } from "../../../api/Step";
import { Tag } from "../../../api/Tag";
import { UniqueName } from "../../../api/UniqueName";
import { Button } from "../../../components/elements/Buttons/Buttons";
import ErrorCard from "../../../components/elements/ErrorCard";
import Filter, {
  RenderTagFilterItem,
  RenderTagFilterItemsList,
} from "../../../components/elements/Filter/Filter";
import ImageUpload from "../../../components/elements/ImageUpload/ImageUpload";
import Loading from "../../../components/elements/Loading";
import NoAccess from "../../../components/elements/NoAccess";
import TextField, {
  TextArea,
} from "../../../components/elements/TextField/TextField";
import CreateIngredientsTable from "../../../components/views/CreateIngredientsTable/CreateIngredientsTable";
import CreateStepsList from "../../../components/views/CreateStepsList/CreateStepsList";
import { useMe } from "../../../hooks/useMe";
import { useTranslations } from "../../../hooks/useTranslations";
import CardLayout from "../../../layouts/CardLayout";

import styles from "./[recipe].module.scss";

interface EditRecipeProps {
  recipe?: Recipe;
  tags: Tag[];
  dataLoadError?: string;
}

const RECIPE_NAME = "recipe_name";
const RECIPE_OVEN_TEMPERATURE = "recipe_oven_temperature";
const RECIPE_COOKING_TIME = "recipe_cooking_time";
const RECIPE_DESCRIPTION = "recipe_description";
const RECIPE_PORTIONS = "recipe_portions";
const RECIPE_PORTIONS_SUFFIX = "recipe_portions_suffix";

const EditRecipe = ({ recipe, dataLoadError, tags }: EditRecipeProps) => {
  const { t, translate } = useTranslations();
  const { isLoggedIn, me } = useMe();
  const router = useRouter();

  /* Keep track of the different parts of the state */
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState(recipe ? recipe.name : "");
  const [cookingTime, setCookingTime] = useState(
    recipe?.estimatedTime && recipe?.estimatedTime > 0
      ? recipe?.estimatedTime
      : undefined
  );
  const [ovenTemp, setOvenTemp] = useState(
    recipe?.ovenTemperature && recipe.ovenTemperature > 0
      ? recipe?.ovenTemperature
      : undefined
  );
  const [portions, setPortions] = useState(
    recipe?.portions && recipe.portions > 0 ? recipe?.portions : undefined
  );
  const [portionsSuffix, setPortionsSuffix] = useState(
    recipe?.portionsSuffix ?? ""
  );
  const [description, setDescription] = useState(
    recipe ? recipe.description : ""
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>(recipe?.tags ?? []);
  const [ingredients, setIngredients] = useState<EditableIngredient[]>(
    recipe ? ingredientsToEditable(recipe.ingredients) : []
  );
  const [steps, setSteps] = useState<Step[]>(
    recipe ? recipe.steps.sort((a, b) => a.number - b.number) : []
  );
  const [images, setImages] = useState<Image[]>(recipe ? recipe.images : []);
  const [imageUploadInProgress, setImageUploadInProgress] =
    useState<boolean>(false);
  /* End state declaration */

  /* Check if we have unsaved changes */
  const cookingTimeSame =
    (cookingTime !== undefined ? cookingTime : 0) === recipe?.estimatedTime;
  const tempSame =
    (ovenTemp !== undefined ? ovenTemp : 0) === recipe?.ovenTemperature;
  const portionsSame =
    (portions !== undefined ? portions : 0) === recipe?.portions;

  const unsavedChanges =
    name !== recipe?.name ||
    !cookingTimeSame ||
    !tempSame ||
    !portionsSame ||
    portionsSuffix !== recipe?.portionsSuffix ||
    description !== recipe?.description ||
    !ingredientsSame(ingredients, ingredientsToEditable(recipe?.ingredients)) ||
    recipe.tags.length !==
      recipe.tags.filter((t) => selectedTags.some((st) => st.id === t.id))
        .length ||
    !stepsSame(steps, recipe?.steps) ||
    !imagesSame(images, recipe.images);
  /* End check if we have unsaved changes */

  useEffect(() => {
    const confirmLeaveFunc = function (e: BeforeUnloadEvent) {
      if (unsavedChanges && !submitted) {
        e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
        // Chrome requires returnValue to be set
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", confirmLeaveFunc);
    return () => window.removeEventListener("beforeunload", confirmLeaveFunc);
  }, [unsavedChanges, submitted]);

  if (dataLoadError) {
    return <ErrorCard error={dataLoadError} />;
  }

  if (!recipe) {
    return <Loading />;
  }

  if (!isLoggedIn && isClientSide()) {
    router.push(LOGIN_ENDPOINT);
  }

  if (me && !me?.owners.some((owner) => owner.id === recipe.author.id)) {
    return <NoAccess text={t.recipe.noAccess} backUrl={ROOT_ENDPOINT} />;
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    const newRecipe: EditRecipe = {
      id: recipe.id,
      name: name,
      uniqueName: recipe.uniqueName,
      description: description,
      ovenTemperature: ovenTemp ? ovenTemp : 0,
      estimatedTime: cookingTime ? cookingTime : 0,
      portions: portions ? portions : 0,
      portionsSuffix: portionsSuffix,
      ingredients: ingredientsFromEditable(ingredients),
      steps: steps,
      images: images,
      author: recipe.author,
      tags: selectedTags.map((t) => t.id),
    };
    Api.recipes.edit(newRecipe).then((response: ApiResponse<UniqueName>) => {
      if (response.error && response.errorTranslationString) {
        setError(translate(response.errorTranslationString));
        setSubmitted(false);
      } else {
        window.location.assign(
          `${RECIPES_BASE_ENDPOINT}/${response.data?.uniqueName}`
        );
      }
    });
  };

  return (
    <CardLayout>
      <form
        className={`card ${styles.editRecipeCardColumn}`}
        onSubmit={onSubmit}
      >
        <h3>{t.recipe.editRecipe}</h3>

        {/* Recipe name */}
        <div className={styles.formRow}>
          <label htmlFor={RECIPE_NAME} className={styles.formLabel}>
            {t.recipe.recipeName}
          </label>
          <TextField
            variant="outlined"
            name={RECIPE_NAME}
            id={RECIPE_NAME}
            placeholder={t.recipe.recipeName}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            required
            maxLength={120}
            className={styles.formInputElement}
          />
        </div>

        <div className={styles.splitFormRow}>
          {/* Cooking time */}
          <div className={styles.splitFormRowElement}>
            <label htmlFor={RECIPE_COOKING_TIME} className={styles.formLabel}>
              {t.recipe.cookingTime}
            </label>
            <TextField
              variant="outlined"
              name={RECIPE_COOKING_TIME}
              id={RECIPE_COOKING_TIME}
              placeholder={t.recipe.cookingTime}
              value={cookingTime}
              onChange={(e) => {
                const number = parseInt(e.target.value);
                setCookingTime(number);
              }}
              type="number"
              min={0}
              max={999}
              className={styles.formInputElement}
              postfixText={t.recipe.minutes}
            />
          </div>

          <div className="space" />

          {/* Oven temperature */}
          <div className={styles.splitFormRowElement}>
            <label
              htmlFor={RECIPE_OVEN_TEMPERATURE}
              className={styles.formLabel}
            >
              {t.recipe.ovenTemperature}
            </label>
            <TextField
              variant="outlined"
              name={RECIPE_OVEN_TEMPERATURE}
              id={RECIPE_OVEN_TEMPERATURE}
              placeholder={t.recipe.ovenTemperature}
              value={ovenTemp}
              onChange={(e) => {
                const number = parseInt(e.target.value);
                setOvenTemp(number);
              }}
              type="number"
              min={0}
              max={999}
              step={5}
              className={styles.formInputElement}
              inputClassName={styles.splitRowInput}
              postfixText={t.recipe.degrees}
            />
          </div>
        </div>

        <div className="space" />

        <div className={styles.splitFormRow}>
          {/* Portions */}
          <div className={styles.splitFormRowElement}>
            <label htmlFor={RECIPE_PORTIONS} className={styles.formLabel}>
              {t.recipe.portions}
            </label>
            <TextField
              variant="outlined"
              name={RECIPE_PORTIONS}
              id={RECIPE_PORTIONS}
              placeholder={t.recipe.portions}
              value={portions}
              onChange={(e) => {
                const number = parseInt(e.target.value);
                setPortions(number);
              }}
              type="number"
              min={0}
              max={999}
              maxLength={120}
              className={styles.formInputElement}
              postfixText={t.recipe.portionsSmall}
            />
          </div>

          <div className="space" />

          {/* Portions Suffix */}
          <div className={styles.splitFormRowElement}>
            <label
              htmlFor={RECIPE_PORTIONS_SUFFIX}
              className={styles.formLabel}
            >
              {t.recipe.portionsSuffix}
            </label>
            <TextField
              variant="outlined"
              name={RECIPE_PORTIONS_SUFFIX}
              id={RECIPE_PORTIONS_SUFFIX}
              placeholder={t.recipe.portionsSuffix}
              value={portionsSuffix}
              onChange={(e) => {
                setPortionsSuffix(e.target.value ?? "");
              }}
              maxLength={120}
              className={styles.formInputElement}
            />
          </div>
        </div>

        {/* Description */}
        <div className={styles.formRow}>
          <label htmlFor={RECIPE_DESCRIPTION} className={styles.formLabel}>
            {t.recipe.description}
          </label>
          <TextArea
            name={RECIPE_DESCRIPTION}
            id={RECIPE_DESCRIPTION}
            placeholder={t.recipe.description}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            maxLength={1000}
            className={styles.formInputElement}
            textAreaClassName={styles.textAreaElement}
          />
        </div>

        <div className={styles.detailsContainer}>
          <h3 className="margin">{t.header.tags}</h3>
          <Filter
            title={t.recipe.addTags}
            items={tags}
            selectedItems={selectedTags}
            setSelectedItems={setSelectedTags}
            size={"fixed"}
            filterPlaceholder={t.tag.searchTags}
            renderFilterItem={RenderTagFilterItem}
            renderItemList={RenderTagFilterItemsList}
          />
        </div>

        <div className={`marginTopBig ${styles.ingredientsTableContainer}`}>
          <CreateIngredientsTable
            ingredients={ingredients}
            setIngredients={setIngredients}
          />
        </div>

        <div className={`marginTopBig ${styles.ingredientsTableContainer}`}>
          <CreateStepsList steps={steps} setSteps={setSteps} />
        </div>

        <h3 className="marginTopBig">{t.image.image}</h3>
        <ImageUpload
          imageUploadInProgress={imageUploadInProgress}
          setImageUploadInProgress={setImageUploadInProgress}
          images={images}
          setImages={setImages}
        />

        {error && <p className="errorText marginTop">{error}</p>}

        <Button
          variant="primary"
          size="normal"
          type="submit"
          disabled={imageUploadInProgress}
          className="marginTopBig"
        >
          {t.recipe.saveRecipe}
        </Button>

        {unsavedChanges && (
          <p className={`marginTop ${styles.unsavedChangesText}`}>
            {t.common.unsavedChanges}
          </p>
        )}
      </form>
    </CardLayout>
  );
};

function ingredientsSame(
  ingredients: EditableIngredient[],
  other: EditableIngredient[]
): boolean {
  if (ingredients.length !== other.length) {
    return false;
  }

  for (let i = 0; i < ingredients.length; i++) {
    const a = ingredients[i];
    const b = other[i];
    if (
      a.name !== b.name ||
      a.amount !== b.amount ||
      a.unit !== b.unit ||
      a.number !== b.number
    ) {
      return false;
    }
  }

  return true;
}

function stepsSame(steps: Step[], other: Step[]): boolean {
  if (steps.length !== other.length) {
    return false;
  }

  for (let i = 0; i < steps.length; i++) {
    const a = steps[i];
    const b = other[i];

    if (a.number !== b.number || a.description !== b.description) {
      return false;
    }
  }

  return true;
}

function imagesSame(images: Image[], other: Image[]): boolean {
  if (images.length !== other.length) {
    return false;
  }

  for (let i = 0; i < images.length; i++) {
    const a = images[i];
    const b = other[i];

    if (a.id !== b.id) {
      return false;
    }
  }

  return true;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const recipe = context.params?.recipe;
  if (!recipe || !(typeof recipe === "string")) {
    return {
      notFound: true,
    };
  }

  const res = await Api.recipes.getOne(recipe);
  const resTags = await Api.tags.getAll();

  if (res.rawResponse?.status === 404) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      dataLoadError: res.errorTranslationString ?? null,
      recipe: res.data ?? null,
      tags: resTags.data?.tags ?? [],
    },
  };
};

export default EditRecipe;
