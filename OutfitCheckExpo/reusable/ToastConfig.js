import { BaseToast, ErrorToast } from 'react-native-toast-message';

const darkBaseStyle = {
    borderLeftWidth: 4,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#1E1E1E',
};

export const toastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{
                ...darkBaseStyle,
                borderLeftColor: '#32CD80', // green
            }}
            text1Style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}
            text2Style={{ color: '#AAAAAA', fontSize: 14 }}
        />
    ),
    error: (props) => (
        <ErrorToast
            {...props}
            style={{
                ...darkBaseStyle,
                borderLeftColor: '#FF6B6B', // red
            }}
            text1Style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}
            text2Style={{ color: '#AAAAAA', fontSize: 14 }}
        />
    ),
};
