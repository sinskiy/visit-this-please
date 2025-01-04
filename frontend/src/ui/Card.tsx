import styled from "styled-components";

const Card = styled.div<{ $layer?: string | false }>`
  background-color: ${(props) =>
    props.$layer
      ? `var(--surface-container-${props.$layer})`
      : "var(--surface-container)"};
  color: var(--on-surface);
  padding: 16px 32px;
  padding-bottom: 32px;
  border-radius: 8px;
`;
export default Card;
