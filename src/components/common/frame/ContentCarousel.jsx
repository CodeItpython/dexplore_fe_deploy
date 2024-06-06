import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@components/common/shadcn/carousel";
import {
  Card,
  CardContent,
} from "@components/common/shadcn/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/common/shadcn/dropdown-menu";

import styled from "styled-components";
import {AiFillDelete, AiOutlinePlus, AiOutlineMenu} from "react-icons/ai";
import {requestGet, requestPost} from "@lib/network/network";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import QRCode from 'qrcode';

// Styled Components
const StyledFrame = styled.div`
	margin-bottom: 10px;
	margin-top: 10px;
	padding-left: 16px;
	padding-right: 16px;
	min-width: 365px;
`;

const StyledHeaderFrame = styled.div`
	min-width: 345px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-right: 20px;
	margin-right: -20px;
`;

const StyledHeader = styled.div`
	margin-top: 10px;
	font-weight: 600;
	color: #000000;
`;

const StyledTitle = styled.div`
	font-size: 12px;
	font-weight: 600;
`;

const StyledDescription = styled.div`
	font-size: 10px;
	font-weight: 300;
	color: #909090;
	line-height: 11px;
`;

const StyledListIcon = styled(AiOutlineMenu)`
	stroke: white;
	stroke-width: 20px;
	fill: currentColor;
	background-color: rgba(255, 255, 255, 0.4);
	width: 30px;
	height: 30px;
	position: absolute;
	top: 1px;
	right: 1px;
	border-radius: 10%;
`;

const StyledDropDownMenuTrigger = styled(DropdownMenuTrigger)`
	stroke: white;
	stroke-width: 20px;
	fill: currentColor;
	width: 17px;
	height: 17px;
	position: absolute;
	top: 5px;
	right: 5px;
	border-radius: 50%;
`;

const StyledImageWrapper = styled.div`
	position: relative;
	width: 100%;
	height: 100%;
`;

const StyledAddWrapper = styled.div`
	font-size: 12px;
	font-weight: 600;
	text-align: center;
`;

const ListIcon = ({isMuseum = true, id, chosenMuseum}) => {
  const navigate = useNavigate();
  const [isDelete, setIsDelete] = useState(false);

  const handleDeleteClick = () => {
    const userAnswer = window.confirm("삭제하시겠습니까?");
    setIsDelete(userAnswer);

    if (userAnswer) {
      const url = isMuseum
        ? "https://dexplore.info/api/v1/admin/delete-museum"
        : "https://dexplore.info/api/v1/admin/delete-art";
      const bodyData = isMuseum ? {museumId: id} : {artId: id};
      requestPost(url, bodyData).then((v) => {
        setIsDelete(!userAnswer);
        window.location.reload();
      });
    }
  };

  const handleUpdateClick = () => {
    const path = isMuseum ? "/admin/museum/update" : "/admin/art/update";
    isMuseum
      ? navigate(path, {state: {id}})
      : navigate(path, {state: {id, museumId: chosenMuseum.museumId}});
  };

  const handleQrDownload = async () => {
    if (!isMuseum) {
      try {
        const artResponse = await requestGet(`https://dexplore.info/api/v1/user/get-art`, {artId: id});
        const qrcodeId = artResponse.art.qrcodeId;
        const qrcodeResponse = await requestGet('https://dexplore.info/api/v1/user/get-qrcode', {qrcodeId});
        const qrHash = qrcodeResponse.qrcode.qrcodeHashkey;
        // setQRCodeHash(qrHash);

        try {
          const canvas = document.createElement('canvas');
          await QRCode.toCanvas(canvas, qrHash, { errorCorrectionLevel: 'H' });
          const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `${qrHash}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } catch (error) {
          console.error(error);
        }

      } catch (error) {
        console.error('QR code download failed:', error);
      }
    }
  };

  return (
    <DropdownMenu>
      <StyledDropDownMenuTrigger>
        <StyledListIcon/>
      </StyledDropDownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>작업 목록</DropdownMenuLabel>
        <DropdownMenuSeparator/>
        <DropdownMenuItem onClick={handleDeleteClick}>
          {isMuseum ? "박물관" : "작품"} 삭제
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleUpdateClick}>
          {isMuseum ? "박물관" : "작품"} 수정
        </DropdownMenuItem>
        {!isMuseum ? (
          <DropdownMenuItem onClick={handleQrDownload}>
            QR 다운로드
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleQrDownload}>
            QR 전체 다운로드
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CarouselItemComponent = ({
                                 isAdmin,
                                 imageSrc,
                                 title,
                                 description,
                                 isMuseum,
                                 id,
                                 chosenMuseum,
                                 isRecommend = false,
                               }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/user/museum", {state: {museumId: id}});
  };

  return (
    <CarouselItem
      className="basis-[35%] pl-[3px]"
      onClick={(!isAdmin && isMuseum && !isRecommend) ? handleClick : null}
    >
      <div className="p-1">
        <Card className="h-full w-full">
          <CardContent className="flex aspect-square items-center justify-center p-0 relative">
            <StyledImageWrapper>
              {isAdmin && (
                <ListIcon
                  isMuseum={isMuseum}
                  id={id}
                  chosenMuseum={chosenMuseum}
                />
              )}
              <img
                src={imageSrc}
                alt={title}
                className="h-full w-full object-cover rounded-lg"
              />
            </StyledImageWrapper>
          </CardContent>
        </Card>
        <StyledTitle>{title}</StyledTitle>
        <StyledDescription>
          {description &&
            (description.length > 50
              ? description.substring(0, 50) + "..."
              : description)}
        </StyledDescription>
      </div>
    </CarouselItem>
  );
};

const AddNewItemComponent = ({isMuseum, chosenMuseum}) => {
  const navigate = useNavigate();
  const message = isMuseum ? "박물관" : "작품";

  const handleClick = () => {
    const path = isMuseum ? "/admin/museum/create" : "/admin/art/create";
    isMuseum
      ? navigate(path)
      : navigate(path, {state: {museumId: chosenMuseum.museumId}});
  };

  return (
    <CarouselItem className="basis-[35%] pl-[3px]" onClick={handleClick}>
      <div className="p-1">
        <Card className="h-full w-full border-2 border-dashed border-gray-500">
          <CardContent className="flex flex-col aspect-square items-center justify-center p-0 relative bg-gray-200">
            <AiOutlinePlus className="text-5xl text-gray-500"/>
            <StyledAddWrapper>{message} 추가하기</StyledAddWrapper>
          </CardContent>
        </Card>
      </div>
    </CarouselItem>
  );
};

const ContentCarousel = ({
                           name,
                           museumSelector,
                           itemInfo,
                           isAdmin = true,
                           isMuseum,
                           chosenMuseum,
                           isRecommend,
                         }) => {
  return (
    <StyledFrame>
      <StyledHeaderFrame>
        <StyledHeader>{name}</StyledHeader>
        {museumSelector}
      </StyledHeaderFrame>
      <Carousel opts={{align: "start"}} className="min-w-[345px] max-w-[600px]">
        <CarouselContent className="ml-0">
          {itemInfo.map((item) => {
            const info = isMuseum
              ? {
                id: item.museumId,
                name: item.museumName,
                imgUrl: item.imgUrl,
                description: item.description,
              }
              : {
                id: item.artId,
                name: item.artName,
                imgUrl: item.imgUrl,
                description: item.artDescription,
              };

            return (
              <CarouselItemComponent
                key={info.id}
                isAdmin={isAdmin}
                imageSrc={info.imgUrl}
                title={info.name}
                description={info.description}
                isMuseum={isMuseum}
                id={info.id}
                chosenMuseum={chosenMuseum}
                isRecommend={isRecommend}
              />
            );
          })}
          {isAdmin && (
            <AddNewItemComponent
              isMuseum={isMuseum}
              chosenMuseum={chosenMuseum}
            />
          )}
        </CarouselContent>
      </Carousel>
    </StyledFrame>
  );
};

// 세로 슬라이드 컴포넌트 추가
const VerticalCarouselItemComponent = ({
                                         isAdmin,
                                         imageSrc,
                                         title,
                                         description,
                                         isMuseum,
                                         id,
                                         chosenMuseum,
                                         isRecommend = false,
                                         imgClassName, // 새로운 prop 추가
                                         isLink = true,
                                       }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/user/art/info/", {state: {artId: id}});
  };

  return (
    <CarouselItem
      className="mb-4" // 세로 방향 여백 추가
      onClick={(isLink) ? handleClick : null}
    >
      <div className="p-1">
        <Card className="h-full w-full">
          <CardContent className="flex items-center justify-center p-0 relative">
            <StyledImageWrapper className="h-48 w-full"> {/* 이미지 크기 조정 */}
              {isAdmin && (
                <ListIcon
                  isMuseum={isMuseum}
                  id={id}
                  chosenMuseum={chosenMuseum}
                />
              )}
              <img
                src={imageSrc}
                alt={title}
                className={imgClassName} // 추가한 imgClassName prop 사용
              />
            </StyledImageWrapper>
          </CardContent>
        </Card>
        <StyledTitle>{title}</StyledTitle>
        <StyledDescription>
          {description &&
            (description.length > 50
              ? description.substring(0, 50) + "..."
              : description)}
        </StyledDescription>
      </div>
    </CarouselItem>
  );
};

const VerticalContentCarousel = ({
                                   name,
                                   museumSelector,
                                   itemInfo,
                                   isAdmin = true,
                                   isMuseum,
                                   chosenMuseum,
                                   isRecommend,
                                   isLink,
                                 }) => {
  return (
    <StyledFrame>
      <StyledHeaderFrame>
        <StyledHeader>{name}</StyledHeader>
        {museumSelector}
      </StyledHeaderFrame>
      <Carousel opts={{axis: "y", align: "start"}} className="min-h-[345px] max-h-[600px] overflow-y-scroll">
        <CarouselContent className="flex flex-col">
          {itemInfo.map((item) => {
            const info = isMuseum
              ? {
                id: item.museumId,
                name: item.museumName,
                imgUrl: item.imgUrl,
                description: item.description,
              }
              : {
                id: item.artId,
                name: item.artName,
                imgUrl: item.imgUrl,
                description: item.artDescription,
              };

            return (
              <VerticalCarouselItemComponent
                key={info.id}
                isAdmin={isAdmin}
                imageSrc={info.imgUrl}
                title={info.name}
                description={info.description}
                isMuseum={isMuseum}
                id={info.id}
                chosenMuseum={chosenMuseum}
                isRecommend={isRecommend}
                imgClassName="h-48 w-full object-cover rounded-lg" // 이미지 크기 조정
              />
            );
          })}
          {isAdmin && (
            <AddNewItemComponent
              isMuseum={isMuseum}
              chosenMuseum={chosenMuseum}
            />
          )}
        </CarouselContent>
      </Carousel>
    </StyledFrame>
  );
};

export default ContentCarousel;
export {VerticalContentCarousel};
