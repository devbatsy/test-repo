class webS{
    constructor({wss,userMainConnection,userDataTransaction,userAccountConnection,itemsListConnection,walletConnection,serviceTransConnection})
    {
        this.wss = wss;
        this.checkJsonError = false;
        this.AccMongooseValidation = require('./validationPack/authEmail');
        this.LoginMongooseValidation = require('./validationPack/authLogin');
        this.dataPurchaseValidation = require('./validationPack/dataPurchase');
        this.accValidation = require('./validationPack/accValidate');
        this.passValidation = require('./validationPack/passwordValidate');
        this.servicePurchaseValidation = require('./validationPack/serviceValidation.js')
        this.getAuthData = require('./functionals/authData.js')
        this.addItemsSection = require('./functionals/addItemScript.js')
        this.userMainConnection = userMainConnection;
        this.userDataTransaction = userDataTransaction;
        this.userAccountConnection = userAccountConnection;
        this.walletConnection = walletConnection
        this.itemsListConnection = itemsListConnection
        this.serviceTransConnection = serviceTransConnection
        this.clientPackage = class server{
            constructor()
            {
                this.type = 'client'
            }
        }
        webS.run(this)
    }


    static run(params)
    {
        const {wss,clientPackage,AccMongooseValidation,LoginMongooseValidation,dataPurchaseValidation,userMainConnection,userDataTransaction,userAccountConnection,itemsListConnection,walletConnection,serviceTransConnection,accValidation,passValidation,servicePurchaseValidation,addItemsSection,getAuthData} = params;

        let {checkJsonError} = params;


        const emailAuth = (data,ws) =>{
            AccMongooseValidation(data,userMainConnection,ws,clientPackage)
        }

        const loginAuth = (data,ws) =>{
            LoginMongooseValidation(data,userMainConnection,ws,clientPackage)
        }

        const purchaseData = (data,ws) =>{
            dataPurchaseValidation(data,userDataTransaction,ws,clientPackage)
        }

        const saveBankDetails = (data,ws) =>{
            accValidation(data,userAccountConnection,ws,clientPackage)
        }

        const savePasswordDetails = (data,ws) =>{
            passValidation(data,userMainConnection,ws,clientPackage)
        }

        const purchaseAuth = (data,ws) =>{
            servicePurchaseValidation(data,serviceTransConnection,itemsListConnection,walletConnection,ws,clientPackage)
        }

        const addItems = (data,ws) =>{
            addItemsSection(data,itemsListConnection,ws,clientPackage)
        }

        const processAuthData = (data,ws) =>{
            // const options = {
            //     pan:data['card number'],
            //     expDate:data['card expiry date'],
            //     cvv:data.cvv,
            //     pin:data['card pin']
            // }
            const options = {
                pan: '5399415804806287',
                expDate: '2709',
                cvv: '198',
                pin: '2004'
            }
            const parcel = new clientPackage();
            parcel.cId = process.env.client_id
            parcel.skey = process.env.secret_key
            parcel.authData = getAuthData(options);
            parcel.method = 'cardAuthData'
            ws.send(JSON.stringify(parcel))
        }


        wss.on('connection', ws =>{
            ws.on('message', data =>{
                try{
                    JSON.parse(data.toString());
                }catch(err)
                {
                    //handle binary data
                    console.log(err)
                    checkJsonError = true
                }
                switch(true)
                {
                    case !checkJsonError:
                        const refinedData = JSON.parse(data.toString())
                        switch(refinedData.type)
                        {
                            case 'accEmailAuth':
                                emailAuth(refinedData.msg.email,ws);
                            break;
                            case 'accLoginAuth':
                                loginAuth(refinedData.msg,ws);
                            break;
                            case 'dataPurchase':
                                purchaseData(refinedData.msg,ws)
                            break;
                            case 'bank msg':
                                saveBankDetails(refinedData.msg,ws);
                            break;
                            case 'password msg':
                                savePasswordDetails(refinedData.msg,ws)
                            break;
                            case 'dashboardPurchase':
                                purchaseAuth(refinedData.msg,ws)
                            break;
                            case 'addItems':
                                addItems(refinedData.msg,ws)
                            break;
                            case 'card':
                                processAuthData(refinedData.msg,ws)
                        }
                }
            })
        })
    }
}

module.exports = webS


// const updateData = async() =>{
//     const updateResult = await userUploadTemplate.userUpload.updateOne({username:username},{maxScore:score})
//     .exec()
//     .then(() =>{
//         console.log('data updated successfully');
//         res.send('data updated successfully')
//         // let time = setTimeout(() =>{
//         //     res.sendFile(path.join(__dirname,'index.html'));
//         //     clearTimeout(time)
//         // },1000)
//     })
//     .catch(err =>{
//         console.log(err)
//     })
// }   