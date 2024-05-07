import { 
	DomType,
	sydDOM,
	setStyle,
	styleComponent,
	mount,
	useState,
	getState,
	preState,
	createElement 
} from "../../sydneyLib/sydneyDom.js";

// import {getAccessToken} from './bank.js'

setStyle(
	[
		{
        nameTag:'dashboard',
        style:{
            height:'100%',
            width:'100%',
            display:'flex',
            flexDirection:'column',
            padding:'15px',
            overflowY:'scroll',
            position:'relative',
			padding:'20px'
        }
		},
		{
			nameTag:'walletPagestyle',
			style:{
				height:'fit-content',
				width:'100%',
				background:'#fff',
				boxShadow:'-2px 8px 20px rgba(0,0,0,.2)',
				borderRadius:'10px',
				padding:'20px 20px',
				display:'flex',
				flexDirection:'column',
				rowGap:'30px',

			}
		},
		{
			nameTag:'payPage',
			style:{
				height:'100%',
				width:'100%',
				position:'absolute',
				top:'0',
				left:'0',
				zIndex:'999',
				background:'rgba(255,255,255,.6)',
				justifyContent:'center',
				alignItems:'center',
				padding:'0 10px',
				transition:'opacity .3s linear'
			}
		}
	]
)

class serverPackage{
    constructor({msg,type})
    {
        this.type = type;
        this.msg = msg
    }
}

const ws = new WebSocket('wss://test-repo-v0it.onrender.com');
let sockectConnectionState = false;
let pop_timer;
let loadertimer;
const initLoader = () =>{
    const popState = getState('customPop');
    const loaderState = getState('popLoader')
    popState.y = -120;
    loaderState.trans = 0
    useState('customPop',{type:'a',value:popState})
    useState('popLoader',{type:'a',value:loaderState})
    clearTimeout(pop_timer);
    cancelAnimationFrame(loadertimer)
}
const updatePopup = ({text,bg = undefined}) =>{
    initLoader()
    const popState = getState('customPop');
    const loaderState = getState('popLoader')
    popState.y = 20;
    popState.text = text;
    popState.bg = bg;
    function startIteration(){
        loadertimer = requestAnimationFrame(startIteration)
        loaderState.trans += 1;
        useState('popLoader',{type:'a',value:loaderState})
    }
    startIteration()
    useState('customPop',{type:'a',value:popState})
    pop_timer = setTimeout(() =>{
        initLoader()
    },4000)
}

const sendPurchaseRequest = (response,authData) =>{
	console.log(response)
	const options = {
		method: 'POST',
		mode:'no-cors',
		headers: {
		  accept: 'application/json',
		  authorization: `Bearer ${response.access_token}`,
		  'Content-Type': 'application/json'
		},
		body:JSON.stringify({
		  customerId: 'favour1234',
		  amount: '10000',
		  currency: 'NGN',
		  authData: authData,
		  transactionRef:'09078762938'
		})
	  };
	  
	  fetch('https://qa.interswitchng.com/api/v3/purchases', options)
		.then(response => response.json())
		.then(response => console.log(response))
		.catch(err => console.log(err));
}

ws.addEventListener('open', () =>{
    sockectConnectionState = true;
    updatePopup({text:'connection sucessful',bg:'rgba(92, 248, 92, 0.5)'})

	ws.addEventListener('message',({data}) =>{
		const parcel = JSON.parse(data)
		switch(parcel.method)
		{
			case 'cardAuthData':
				const binary = btoa(`${parcel.cId}:${parcel.skey}`);
				const options = {
					method: 'POST',
					headers: {
					  accept: 'application/json',
					  'Content-Type': 'application/x-www-form-urlencoded',
					  authorization: `Basic ${binary}`
					}
				  };
				  
				  fetch('https://passport.k8.isw.la/passport/oauth/token?grant_type=client_credentials', options)
					.then(response => response.json())
					.then(response => sendPurchaseRequest(response,parcel.authData))
					.catch(err => console.error(err));
		}
	})
})

ws.addEventListener('close',() =>{
    sockectConnectionState = false;
    let count = 4;
    let timer
    const popFunc = () =>{
        clearTimeout(timer);
        switch(true)
        {
            case count > 0:
                updatePopup({text:`connection closed, page will be reloaded in ${count}s`})
                count--;
                timer = setTimeout(popFunc,1000);
            break;
            default:
                location.reload()
        }
    }
    popFunc()
})

sydDOM.serviceSection = () =>{
    return createElement(
        'div',
        {
            style:styleComponent.dashboard()
        },
		[
			sydDOM.walletPage(),
			sydDOM.customPop()
		]
    )
}

sydDOM.walletPage = () =>{
	return createElement(
		'div',
		{
			style:styleComponent.walletPagestyle()
		},
		[
			sydDOM.payPage(),
			sydDOM.balanceSec(),
			sydDOM.button({type:'transfer',text:'pay via automated bank transfer'}),
			createElement('hr',{style:'height:1px;width:100%;background:lightgrey'}),
			sydDOM.button({type:'card',text:'pay via card'})
		]
	)
}

sydDOM.balanceSec = () =>{
	return createElement(
		'div',
		{
			style:'height:fit-content;width:100%;display:flex;justify-content:space-between;'
		},
		[
			sydDOM.createBalance(preState(['balanceSec','ab']),'available balance'),
			sydDOM.createBalance(preState(['balanceSec','lr']),'last recharge')
		],
		{
			createState:{
				stateName:'balanceSec',
				state:{
					ab:'0.00',
					lr:'0.00'
				}
			},
			type:'balanceSec'
		}
	)
}

sydDOM.createBalance = (balance = '0.00',text) =>{
	return createElement(
		'div',
		{
			style:'display:flex;flex-direction:column;row-gap:15px;align-items:center;text-transform:capitalize;padding:10px;'
		},
		[
			createElement('h2',{style:'font-weight:400;font-family:copse'},[`₦${balance}`]),
			text
		]
	)
}

sydDOM.button = ({type,text}) =>{
	pay = (type) =>{
		const payState = getState('payPage');
		payState.d = 'flex';
		payState.transactionMeans = type
		payState.current = type === 'card' ? 1 : 0
		useState('payPage',{type:"a",value:payState})
		const timer = setTimeout(() =>{
			payState.o = '1'
			const state1 = getState('bankPage')
			const state2 = getState('transferPage')
			state1.d = type === 'card' ? 'flex' : 'none'
			state2.d = type === 'card' ? 'none' : 'flex'
			useState('bankPage',{type:'a',value:state1})
			useState('transferPage',{type:'a',value:state2})
			useState('payPage',{type:"a",value:payState})

			clearTimeout(timer)
		},100)
	}
	return createElement(
		'div',
		{
			style:`width:100%;padding:13px 0;color:#fff;text-transform:capitalize;font-size:14px;text-align:center;box-shadow:-2px 4px 4px rgba(0,0,0,.3);border-radius:5px;background:${type === 'transfer' ? '#2F55DC' : '#000'}`,
			class:'select',
			onclick:`pay('${type}')`
		},
		[
			text
		]
	)
}

sydDOM.payPage = () =>{
	return createElement(
		'div',
		{
			style:styleComponent.payPage({method:'add',style:{display:preState(['payPage','d'],'none'),opacity:preState(['payPage','o'],'0')}})
		},
		[
			sydDOM.bankPage(),
			sydDOM.transferPage()
		],
		{
			createState:{
				stateName:'payPage',
				state:{d:'none',o:'0',data:{}}
			},
			type:'payPage'
		}
	)
}

sydDOM.bankPage = () =>{
	return createElement(
		'form',
		{
			style:styleComponent.walletPagestyle({method:'add',style:{width:'100%',maxWidth:'500px',maxHeight:'80%',overflowY:'scroll',background:'#fff',display:preState(['bankPage','d'],'flex')}})
		},
		[
			createElement('h3',{style:'font-weight:100;text-transform:uppercase;text-align:center;line-height:70px;width:100%;'},['Quick teller pay with card']),
			createElement('hr',{style:'min-height:2px;width:100%;background:lightgrey'}),
			sydDOM.info_box('Card Number'),
			sydDOM.info_box('Card Expiry Date'),
			sydDOM.info_box('CVV'),
			sydDOM.info_box('Card Pin'),
			sydDOM.buttonPack('card')
		],
		{
			createState:{
				stateName:'bankPage',
				state:{d:'flex'}
			},
			type:"bankPage"
		}
	)
}

sydDOM.transferPage = () =>{
	return createElement(
		'form',
		{
			style:styleComponent.walletPagestyle({method:'add',style:{width:'100%',maxWidth:'500px',maxHeight:'80%',overflowY:'scroll',background:'#fff',display:preState(['transferPage','d'],'none')}})
		},
		[
			createElement('h4',{style:'font-weight:100;text-transform:capitalize;text-align:center;line-height:70px;width:100%;'},['Quick teller pay via transfer']),
			createElement('hr',{style:'height:1px;width:100%;background:lightgrey'}),
			sydDOM.info_box('password'),
			sydDOM.buttonPack('transfer')
		],
		{
			createState:{
				stateName:'transferPage',
				state:{d:'none'}
			},
			type:"transferPage"
		}
	)
}

sydDOM.buttonPack = (text) =>{
	return createElement(
		'div',
		{
			style:'height:fit-content;width:fit-content;display:flex;column-gap:10px'
		},
		[
			sydDOM.createButton(`${text}-submit`),
			sydDOM.createButton()
		]
	)
}

sydDOM.createButton = (type = 'back') =>{
	submitPayment = (type) =>{
		const payState = getState('payPage');
		switch(type)
		{
			case 'back':
				payState.o = '0';
				payState.data = {}
				useState('payPage',{type:"a",value:payState})
				const timer = setTimeout(() =>{
					payState.d = 'none';
					useState('payPage',{type:"a",value:payState})
					clearTimeout(timer)
				},300)
			break;
			default:
				const parcel = new serverPackage({msg:payState.data,type:payState.transactionMeans})

				ws.send(JSON.stringify(parcel))
		}
	}
	return createElement(
		'div',
		{
			style:`padding:10px 20px;width:fit-content;background:${type !== 'back' ? '#2F55DC' : '#FF5B5C'};color:#fff;border-radius:5px`,
			onclick:`submitPayment('${type}')`,
			class:'select'
		},
		[
			type !== 'back' ? 'Submit' : 'Back'
		]
	)
}


sydDOM.info_box = (text = 'Amount') =>{
    let type = (text.toLowerCase() === 'amount' || text.toLowerCase() === 'card number' || text.toLowerCase() === 'cvv') ? 'number' : 'text';
	type = (text.toLowerCase() === 'password' || text.toLowerCase() === 'card pin') ? 'password' : type
    updateInput = (elem,type) =>{
        const CstateForm = getState('payPage');
        CstateForm.data[`${type.toLowerCase()}`] = elem.value.toLowerCase();
        useState('payPage',{type:'a',value:CstateForm})
    }
	const processPlaceholder = () =>{
		let val;
		switch(text.toLowerCase())
		{
			case 'card number':
				val = 'Eg: 0000 0000 0000 0000'
			break;
			case 'card expiry date':
				val = 'Eg: 00/00'
			break;
			case 'card pin':
				val = 'Eg: 0000'
			break;
			case 'cvv':
				val = 'Eg:000'
			break;
			default:
				val = `Enter ${text.toLowerCase()}`
		}
		return val
	}
    return createElement(
        'div',
        {
            style:styleComponent.info_box({method:'remove',style:['paddingRight','paddingLeft','padding']})
        },
        [
            createElement('p',{style:'color:grey;'},[text+'*']),
            createElement(
                'input',
                {
                    style:styleComponent.input({method:'add',style:{textTransform:type === 'text' ? 'capitalize' : 'unset'}}),
                    oninput:`updateInput.bind()(this,'${text}')`,
					placeholder:processPlaceholder(),
                    type:type,
                    name:text+'_n',
                    id:text + '_id'
                },)
        ]
    )
}

sydDOM.customPop = () =>{
	return createElement(
		'div',
		{
			style:`height:fit-content;width:300px;background:${preState(['customPop','bg'],'rgba(194,74,74,0.7)')};color:#000;position:fixed;z-index:1100;top:0;left:50%;transform:translateX(-50%) translateY(${preState(['customPop','y'],-120)}%);display:flex;justify-content:center;align-items:center;padding:20px 10px;font-size:14px;text-align:center;transition:all linear .3s;overflow:hidden;opacity:${preState(['customPop','y'],-120) === -120 ? '0' : '1'}`
		},
		[
			preState(['customPop','text'],''),
			sydDOM.popLoader()
		],
		{
			createState:{
				stateName:'customPop',
				state:{y:-120,text:'',bg:'rgba(194,74,74,0.7)'}
			},
			type:'customPop'
		}
	)
}
sydDOM.popLoader = () =>{
	return createElement(
		'div',
		{
			style:`position:absolute;bottom:0;height:3px;opacity:.6;width:100%;transform:translateX(${(preState(['popLoader','trans'],0)/-2.4)}%);background:#9db1f8a9`
		},
		[],
		{
			createState:{
				stateName:'popLoader',
				state:{trans:0}
			},
			type:'popLoader'
		}
	)
}
