import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Translate from 'components/translate/Translate'
import METAMASK_DL_IMG from 'resources/download-metamask.png'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import AuthHoc from './AuthHoc'
import { AUTH_TYPES } from 'constants/misc'
import { AddrItem } from './AuthCommon'
import {
	ContentBox,
	ContentBody,
	ContentStickyTop,
	TopLoading
} from 'components/common/dialog/content'
import Helper from 'helpers/miscHelpers'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getEthers } from 'services/smart-contracts/ethers'
import { getSigner } from 'services/smart-contracts/actions/ethers'
import { getAddressBalances } from 'services/smart-contracts/actions/stats'

class AuthMetamask extends Component {
	constructor(props) {
		super(props)
		this.state = {
			method: '',
			sideSelect: false,
			address: null,
			stats: null,
			waitingMetamaskAction: false,
			waitingAddrsData: false
		}
	}

	checkMetamask = async () => {
		this.setState({ waitingAddrsData: true }, async () => {
			try {
				const authType = AUTH_TYPES.METAMASK.name
				const { provider } = await getEthers(authType)
				const wallet = {
					authType: authType
				}

				const metamaskSigner = await getSigner({ wallet, provider })
				const address = await metamaskSigner.getAddress()
				const stats = await getAddressBalances({ address: { address }, authType })				

				this.setState({
					address,
					stats,
					waitingAddrsData: false
				})

				this.props.updateWallet({
					address,
					authType: AUTH_TYPES.METAMASK.name,
					balanceEth: stats.balanceEth,
					balanceDai: stats.balanceDai,
					signType: AUTH_TYPES.METAMASK.signType
				})
			} catch (err) {
				console.error('Error: catch', err)
				this.setState({ waitingMetamaskAction: false, waitingAddrsData: false })
				this.props.actions.addToast({
					type: 'cancel',
					action: 'X',
					label: this.props.t(
						'ERR_AUTH_METAMASK',
						{
							args: [Helper.getErrMsg(err)]
						}),
					timeout: 5000
				})
			}
		})
	}

	render() {
		const { t, classes } = this.props
		const { address, stats } = this.state

		return (
			<ContentBox className={classes.tabBox} >
				{this.state.waitingMetamaskAction ?
					<ContentStickyTop>
						<TopLoading msg={t('METAMASK_WAITING_ACTION')} />
					</ContentStickyTop>
					: this.state.waitingAddrsData ?
						<TopLoading msg={t('METAMASK_WAITING_ADDR_INFO')} />
						: null
				}
				<ContentBody>
					<Typography paragraph variant='subheading'>
						{t('METAMASK_INFO')}
					</Typography>
					<Typography paragraph>
						<span
							dangerouslySetInnerHTML={
								{
									__html: t('METAMASK_BASIC_USAGE_INFO',
										{
											args: [{
												component:
													<Anchor
														href='https://metamask.io/'
														target='_blank'
													>
														https://metamask.io/
													  </Anchor>
											}]
										})
								}
							}
						/>
					</Typography>
					<Typography paragraph>
						<Anchor href='https://metamask.io/' target='_blank'>
							<Img
								src={METAMASK_DL_IMG}
								alt={'Downlad metamask'}
								className={classes.dlBtnImg}
							/>
						</Anchor>
					</Typography>
					{address ?
						<div className={classes.metamaskLAbel}>
							{stats ?
								<div>
									<Typography
										paragraph
										variant='subheading'
										color='primary'
									>
										{t('METAMASK_CONTINUE_TO_NEXT_STEP')}
									</Typography>
									<AddrItem stats={stats} t={t} addr={address} />
								</div>
								: t('AUTH_WITH_METAMASK_LABEL', { args: [address] })
							}

						</div>
						:
						<Button
							onClick={this.checkMetamask}
							variant='contained'
							color='primary'
							disabled={this.state.waitingAddrsData}
						>
							{t('AUTH_CONNECT_WITH_METAMASK')}
						</Button>

					}
				</ContentBody>
			</ContentBox>
		)
	}
}

AuthMetamask.propTypes = {
	actions: PropTypes.object.isRequired,
	updateWallet: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,	
	classes: PropTypes.object.isRequired
}

export default Translate(AuthHoc(withStyles(styles)(AuthMetamask)))