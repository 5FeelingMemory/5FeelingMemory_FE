import { css } from '@emotion/react';
import ButtonContainer from '@/components/common/Button/ButtonContainer';

export interface ColumnButtonModalProps {
    titleText: string;
    descriptionText: string;
    confirmText: string;
    cancelText: string;
    confirmModal?: () => void;
    closeModal?: () => void;
}

const ColumnButtonModal = ({
    titleText,
    descriptionText,
    confirmText,
    cancelText,
    confirmModal,
    closeModal,
}: ColumnButtonModalProps): JSX.Element => {
    return (
        <div css={modalStyle}>
            <h2>{titleText}</h2>
            <p>{descriptionText}</p>
            <div>
                <ButtonContainer
                    confirmText={confirmText}
                    cancelText={cancelText}
                    size='lg'
                    confirmModal={confirmModal}
                    closeModal={closeModal}
                />
            </div>
        </div>
    );
};

export default ColumnButtonModal;

const modalStyle = css`
    h2 {
        font-size: 24px;
        font-weight: 600;
    }
    p {
        font-size: 18px;
    }

    div {
        margin: 0.5rem 0;
        display: flex;
        justify-content: center;
    }

    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    background-color: #fff;
    width: 300px;
    height: 210px;
    padding: 1.8rem;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-radius: 20px;
    z-index: 10;
    border: 1px solid #ccc;
`;
