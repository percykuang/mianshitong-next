export function buildUsersHref(input: { page: number; pageSize: number }) {
	const searchParams = new URLSearchParams({
		page: String(input.page),
		pageSize: String(input.pageSize),
	})

	return `/users?${searchParams.toString()}`
}
