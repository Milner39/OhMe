export const getFormData = (formData: FormData) => {
	return Object.fromEntries(formData.entries())
}