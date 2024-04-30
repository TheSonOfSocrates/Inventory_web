import {FC} from 'react'
import Router from './router'
// import 'antd/dist/antd.css'
import './style.scss'
import { ConfigProvider } from 'antd'
import themeConfig from './utils/themeConfig'

const App:FC = () => {
    return (
        <ConfigProvider theme={themeConfig}>
            <Router />
        </ConfigProvider>
    ) 
}

export default App