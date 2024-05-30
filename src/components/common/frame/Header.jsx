import styled from "styled-components";
// @ts-ignore
import backgroundMuseumImage from "../../../assets/images/museum_BW2.jpg";

const StyledHeader = styled.header`
	width: 375px;
	height: ${(props) => props.height || '130px'};
	background-image: url(${backgroundMuseumImage});
	background-size: 100%;
	background-position: center;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	align-items: flex-end;
	flex-wrap: wrap;
`;

const StyledWelcomeMessage = styled.div`
  color: white;
  font-size: 24px;
	font-weight:700;
  margin-right: 13px;
  margin-bottom: 6px;
`

const StyledDate = styled.div`
  color: white;
  font-size: 13px;
  margin-right:17px;
  margin-bottom: 6px;
`;

const formatDate = (date) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const formattedDate = date.toLocaleDateString('ko-KR', options).slice(0, -1).replace(/\./g, '-').replace(/- /g, '-');

  const dayOfWeek = date.toLocaleDateString('ko-KR', { weekday: 'short' });

  return `${formattedDate} (${dayOfWeek})`;
};

const Header = ({ height, name }) => {

  const date = new Date('2024-05-26');
  const formattedDate = formatDate(date);

  return (
    <StyledHeader height={height}>
      <StyledWelcomeMessage>
        {name}님, 환영합니다.
      </StyledWelcomeMessage>
      <StyledDate>
        {formattedDate}
      </StyledDate>
    </StyledHeader>
  );
}

export default Header;