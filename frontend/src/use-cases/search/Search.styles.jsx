import styled from "styled-components"
import { DigitDesign, DigitText } from "@cthit/react-digit-components";

export const SearchContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
`;

export const BodyContainer = styled.div`
    margin-top: 40px;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-evenly;
    width: 100%;
`;

export const SearchAddContainer = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: baseline;
    justify-content: center;
`;

export const StyledDigitCard = styled(DigitDesign.Card)`
    background-color: #388e3c;
    padding: 10px;
    margin-bottom: 40px
`

export const OutlinedText = styled(DigitText.Text)`
  -webkit-text-fill-color: yellow;
  -webkit-text-stroke-width: 0.5px;
  -webkit-text-stroke-color: black;
  font-size: x-large;
`;