interface IResponse {
  success: boolean;
  message?: string;
  data?: object;
}

export default {
  createSuccessResponse({
    message,
    data,
  }: {
    message?: string;
    data?: object;
  } = {}) {
    const r: IResponse = {
      success: true,
    };
    if (message) {
      r.message = message;
    }
    if (data) {
      r.data = data;
    }
    return r;
  },

  createErrorResponse({ message, data }: { message?: string; data?: object }) {
    const r: IResponse = {
      success: false,
    };
    if (message) {
      r.message = message;
    }
    if (data) {
      r.data = data;
    }
    return r;
  },
};
