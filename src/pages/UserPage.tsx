import { useState, useEffect, useRef } from "react";
import { throttle } from "lodash";
import { ProfileHeader } from "@/entities/profile/ui";
import { ReviewList } from "@/widgets/reviewList";
import { useFavoriteApi } from "@/shared/api/favorite";
import styles from "@/app/layout/mainLayout/MainLayout.module.scss";
import { useParams } from "react-router-dom";
import { useUserApi } from "@/shared/api/user/userApi";

const UserPage = () => {
	const { id } = useParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { favorites, isLoading } = useFavoriteApi();
  const headerRef = useRef<HTMLDivElement>(null);
  const [ myId, setMyId] = useState(0);

  //------- 차후 reactQuery 세션스토리지로 userId 가져오도록 수정 필요 ------
  const { getMyInfo } = useUserApi();

  useEffect(() => {
    const fetchUserData = async () => {
      try{
        const response = await getMyInfo();
        setMyId(response.userId);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };
    fetchUserData();
  }, []);

  // -------------------------------------------------------

  if (myId === Number(id)) {
    window.location.href = "/mypage";
  }

  useEffect(() => {
    const mainContent = document.querySelector(`.${styles.mainContent}`);
    if (!mainContent || !headerRef.current) return;

    const handleScroll = throttle(() => {
      const scrollTop = mainContent.scrollTop;

      if (!isScrolled && scrollTop > 308) { // 248px은 헤더 축소 완료되기까지의 스크롤 간격
        const oldHeight = headerRef.current?.offsetHeight || 0;
        setIsScrolled(true);

        // 헤더 축소 후 스크롤 위치 보정하기
        // requestAnimationFrame(() => {
        //   const newHeight = headerRef.current?.offsetHeight || 0;
        //   const heightDiff = oldHeight - newHeight;
        //   if (heightDiff > 0) {
        //     mainContent.scrollTop += heightDiff;
        //   }
        // });
      } else if (isScrolled && scrollTop < 308) {
        setIsScrolled(false);
      }
    }, 100);

    mainContent.addEventListener("scroll", handleScroll);
    return () => mainContent.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  const handleViewReviews = () => {
    const mainContent = document.querySelector(`.${styles.mainContent}`);
    if (!mainContent || !headerRef.current ) return;
    mainContent.scrollTop = 309;
  }

  return (
    <div>
      <div ref={headerRef}>
        <ProfileHeader 
          isScrolled={isScrolled}
          onViewReviews={handleViewReviews} 				
        />
      </div>
      <div>
			{ isLoading ? (
			<div>로딩 중...</div> 
			) : (
				<ReviewList type="my" params={{ limit: 10 }} />
			)}
      </div>
    </div>
  );
};

export default UserPage;
