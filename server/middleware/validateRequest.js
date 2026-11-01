export function validateRequest(schema) {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      return response.status(400).json({
        success: false,
        message: 'Please check the submitted information.',
        code: 'VALIDATION_ERROR',
        details: result.error.issues.map(({ path, message }) => ({ field: path.join('.'), message })),
      });
    }
    request.validatedBody = result.data;
    next();
  };
}
