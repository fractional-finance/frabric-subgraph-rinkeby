import { Address, dataSource, log, BigInt, store, DataSourceContext, bigInt } from '@graphprotocol/graph-ts';
import { 
  CrowdfundedThread as CrowdfundedThreadEvent,
  Thread as ThreadEvent,
} from '../../generated/ThreadDeployer/ThreadDeployer';
import { 
  Thread as ThreadContract
} from '../../generated/templates/Thread/Thread';
import { 
  Crowdfund as CrowdfundContract
} from '../../generated/templates/Crowdfund/Crowdfund';
import { Thread as ThreadTemplate } from '../../generated/templates';
import { Crowdfund as CrowdfundTemplate } from '../../generated/templates';
import { Crowdfund, Thread } from '../../generated/schema';
import { getFrabricERC20 } from './helpers/erc20';
import { crowdfundStateAtIndex } from './helpers/types';

// ### THREAD FACTORY ###

export function handleThread(event: ThreadEvent): void {
  let id = event.params.thread.toHexString()

  let crowdfundContext = new DataSourceContext()
  crowdfundContext.setString('id', id)
  ThreadTemplate.createWithContext(event.params.thread, crowdfundContext)

  let threadContract = ThreadContract.bind(event.params.thread)

  let thread = new Thread(id)
  thread.contract = event.params.thread
  thread.variant = event.params.variant
  thread.frabric = threadContract.frabric().toHexString()
  thread.governor = event.params.governor
  thread.erc20 = getFrabricERC20(event.params.erc20).id
  thread.descriptor = event.params.descriptor
  thread.save()
}

export function handleCrowdfundedThread(event: CrowdfundedThreadEvent): void {
  let id = event.params.crowdfund.toHexString()

  let crowdfund = new Crowdfund(id)
  crowdfund.state = crowdfundStateAtIndex(0)
  crowdfund.amountDeposited = BigInt.fromI32(0)
  crowdfund.target = event.params.target
  crowdfund.thread = event.params.thread.toHexString()
  crowdfund.save()

  let crowdfundContext = new DataSourceContext()
  crowdfundContext.setString('id', id)
  CrowdfundTemplate.createWithContext(event.params.crowdfund, crowdfundContext)
}