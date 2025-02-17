import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { otpValidationRules } from './validate';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import useForm from '../../../../../../../utils/useForm';
import Field from '../../../../../../internal/FormFields/Field';
import renderFormField from '../../../../../../internal/FormFields';
import './CtPOneTimePasswordInput.scss';
import CtPResendOtpLink from './CtPResendOtpLink';

interface CtPOneTimePasswordInputProps {
    disabled: boolean;
    isValidatingOtp: boolean;
    errorMessage?: string;
    onSetInputHandlers(handlers: CtPOneTimePasswordInputHandlers): void;
    onPressEnter(): Promise<void>;
    onChange({ data: CtPOneTimePasswordInputDataState, valid, errors, isValid: boolean }): void;
}

interface CtPOneTimePasswordInputDataState {
    otp?: string;
}

export type CtPOneTimePasswordInputHandlers = {
    validateInput(): void;
};

const CtPOneTimePasswordInput = (props: CtPOneTimePasswordInputProps): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const formSchema = ['otp'];
    const [resendOtpError, setResendOtpError] = useState<string>(null);
    const { handleChangeFor, data, triggerValidation, valid, errors, isValid } = useForm<CtPOneTimePasswordInputDataState>({
        schema: formSchema,
        rules: otpValidationRules
    });
    const otpInputHandlersRef = useRef<CtPOneTimePasswordInputHandlers>({ validateInput: null });

    const validateInput = useCallback(() => {
        triggerValidation();
    }, [triggerValidation]);

    useEffect(() => {
        otpInputHandlersRef.current.validateInput = validateInput;
        props.onSetInputHandlers(otpInputHandlersRef.current);
    }, [validateInput, props.onSetInputHandlers]);

    const handleOnResendOtpError = useCallback(
        (errorCode: string) => {
            const message = i18n.get(`ctp.errors.${errorCode}`);
            if (message) setResendOtpError(message);
        },
        [i18n]
    );

    const handleOnKeyUp = useCallback(
        (event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                props.onPressEnter();
            }
        },
        [props.onPressEnter]
    );

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors]);

    return (
        <Field
            name="oneTimePassword"
            label={i18n.get('ctp.otp.fieldLabel')}
            labelEndAdornment={<CtPResendOtpLink disabled={props.isValidatingOtp} onError={handleOnResendOtpError} />}
            errorMessage={resendOtpError || props.errorMessage || !!errors.otp}
            classNameModifiers={['otp']}
        >
            {renderFormField('text', {
                name: 'otp',
                autocorrect: 'off',
                spellcheck: false,
                value: data.otp,
                disabled: props.disabled,
                onInput: handleChangeFor('otp', 'input'),
                onBlur: handleChangeFor('otp', 'blur'),
                onKeyUp: handleOnKeyUp
            })}
        </Field>
    );
};

export default CtPOneTimePasswordInput;
