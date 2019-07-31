import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import classnames from 'classnames'
import Translate from 'components/translate/Translate'
import Slide from '@material-ui/core/Slide'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import Icon from '@material-ui/core/Icon'
import CancelIcon from '@material-ui/icons/Cancel'
import DialogActions from '@material-ui/core/DialogActions'
import Typography from '@material-ui/core/Typography'
import { ContentBox, ContentBody, ContentStickyTop } from 'components/common/dialog/content'
import { logOut, isDemoMode } from 'services/store-data/auth'
import DEMO_IMAGE from 'resources/rekt-eddie.png'
import Img from 'components/common/img/Img'

const textBtn = ({ label, className, classes, style, onClick, ...rest }) => {
	return <span className={classnames(classes.textBtn, className)} style={style} onClick={onClick}> {label} </span>
}

const TextBtn = withStyles(styles)(textBtn)

const Transition = (props) => {
	return <Slide direction="up" {...props} />;
}

export default function ItemHoc(Decorated) {
	class WithDialog extends Component {
		constructor(props) {
			super(props)
			this.state = {
				open: false
			}
		}

		shouldComponentUpdate(nextProps, nextState) {
			const shouldUpdate = (this.state.open !== nextState.open)
				|| (JSON.stringify(this.props) !== JSON.stringify(nextProps))

			return shouldUpdate
		}

		handleToggle = () => {
			this.setState({ open: !this.state.open })
		}

		closeDialog = () => {
			this.setState({ open: false })
		}

		renderDemoModeAction = () => {
			const { classes, t } = this.props
			return (
				<ContentBox>
					<ContentStickyTop>
						<Typography paragraph variant='subheading'>
							{t('DEMO_MODE_ACTION_DESCRIPTION')}
						</Typography>
					</ContentStickyTop>
					<ContentBody>
						<div>
							<Button
								onClick={logOut}
								variant='contained'
								color='primary'
							>
								{t('DEMO_GO_AUTH_BTN')}
							</Button>
						</div>
						<div>
							<Img
								className={classes.demoImg}
								allowFullscreen={false}
								src={DEMO_IMAGE}
								alt={'Demo image'}
							/>
						</div>
					</ContentBody>
				</ContentBox>
			)
		}

		render() {
			let ButtonComponent = Button
			// NOTE: to avoid some warnings
			let btnProps = {}

			if (this.props.iconButton) {
				ButtonComponent = IconButton
			} else if (this.props.textButton) {
				ButtonComponent = TextBtn
			} else {
				btnProps = {
					variant: this.props.variant,
					color: this.props.color,
					size: this.props.size,
					mini: !!this.props.mini
				}
			}

			const { classes, t, ...rest } = this.props

			const btnLabel = t(this.props.btnLabel, { args: this.props.btnLabelArgs || [''] })
			// TODO: fix it for fab wit text
			const isIconBtn = (this.props.variant === 'fab') || this.props.iconButton
			const isDemo = isDemoMode()

			const { open } = this.state

			return (
				<div >
					<ButtonComponent
						disabled={this.props.disabled}
						aria-label={btnLabel}
						label={btnLabel}
						onClick={this.handleToggle}
						{...btnProps}
						// style={this.props.style}
						className={classnames(
							this.props.className,
							{ [classes.floating]: this.props.variant === 'fab' },
							{ [classes.first]: this.props.color === 'first' },
							{ [classes.second]: this.props.color === 'second' }
						)}
					>
						{this.props.icon && <Icon className={classnames({ [classes.btnIconLeft]: !isIconBtn })} > {this.props.icon}</Icon>}
						{!isIconBtn && btnLabel}
					</ButtonComponent>
					<Dialog
						// disableBackdropClick
						// disableEscapeKeyDown
						// maxWidth="xs"
						// fullScreen
						open={open}
						onClose={this.handleToggle}
						TransitionComponent={Transition}
						classes={{ paper: classes.dialog }}
					// onEscKeyDown={this.handleToggle}
					// onOverlayClick={this.handleToggle}
					>
						{/* <AppBar className={classes.appBar}>
                            <Toolbar> */}
						<DialogTitle
							disableTypography

						>
							<Typography
								variant='title'
								classes={
									{ title: classnames(classes.dialogTitle, classes.breakLong) }
								}
							>
								{t(this.props.title)}
								<IconButton
									onClick={this.handleToggle}
								>
									<CancelIcon />
								</IconButton>
							</Typography>
						</DialogTitle>
						{/* </Toolbar>
                        </AppBar> */}
						<DialogContent
							classes={{ root: classes.content }}
						>
							{
								isDemo ?
									// NOTE: ugly but it's temp and saves a lot of work!
									this.renderDemoModeAction()
									:
									<Decorated
										{...rest}
										closeDialog={this.closeDialog}
									/>
							}

						</DialogContent>
						{this.props.dialogActions &&
							<DialogActions>
								{this.props.dialogActions}
							</DialogActions>
						}
					</Dialog>

				</div >
			)
		}
	}

	WithDialog.propTypes = {
		btnLabel: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		floating: PropTypes.bool
	}

	return Translate(withStyles(styles)(WithDialog))
}

