import { connect } from "react-redux";
import RecipeCard from "./RecipeCard.screen";

const mapStateToProps = state => ({
    recipe: state.root.recipe.recipe
});

const mapDispatchToProps = dispatch => ({})

export default connect(mapStateToProps, mapDispatchToProps)(RecipeCard);