export const styles = theme => {
	const spacing = theme.spacing.unit
	return {
		itemActions: {
			display: 'flex',
			flex: '0 0 187px',
			flexDirection: 'column',
			alignItems: 'flex-end',
			justifyContent: 'space-around'
		},
		actionBtn: {
			marginBottom: spacing
		},
		address: {
			wordWrap: 'break-word'
		}
	}
}