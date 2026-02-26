import { useIsMobile } from '../hooks/useMediaQuery';
import ChallengeView from './ChallengeView';
import ChallengeViewMobile from './ChallengeViewMobile';

/**
 * Responsive wrapper that renders mobile or desktop view
 */
export default function ChallengeViewResponsive() {
    const isMobile = useIsMobile();
    
    return isMobile ? <ChallengeViewMobile /> : <ChallengeView />;
}
