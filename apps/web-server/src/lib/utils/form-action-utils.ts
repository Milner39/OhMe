export const getFormData = async (request: Request) => {
	return Object.fromEntries(await request.formData())
}