import {App, Button, Tooltip, ConfigProvider, Flex, Layout, theme} from 'antd'
import DataTable from './DataTable.tsx'
import {useEffect, useState} from 'react'
import {ArrowDownOutlined, MoonOutlined, SunOutlined} from '@ant-design/icons'
import {green, blue, orange} from '@ant-design/colors'

const Main = () => {

    const [darkMode, setDarkMode] = useState(typeof window !== 'undefined' && (window.localStorage.theme === 'dark' || (!('theme' in window.localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)))

    useEffect(() => {
        window.localStorage.setItem('theme', darkMode ? 'dark' : 'light')
    }, [darkMode]);

    return (
        <ConfigProvider theme={{algorithm: darkMode ? theme.darkAlgorithm : undefined}}>
            <App>
                <Layout style={{minHeight: '100vh'}}>
                    <Layout.Header>
                        <Flex>
                            <Flex flex={1}>
                                <Flex>
                                    <img id="logo-icon" src="nzinclopedia.png" alt="n-zinclopedia logo"/>
                                    <div>
                                        <div id="logo-title"><span style={{color: green[6]}}>N-</span><span style={{color: blue[4]}}>Zinc</span><span style={{color: orange[5]}}>lopedia</span></div>
                                        <div id="logo-subtitle">a database of predicted transition metal binding sites</div>
                                    </div>
                                </Flex>
                            </Flex>
                            <Flex align="center" gap="small">
                                <Tooltip title="Download the entire N-Zinclopedia database as a CSV file">
                                    <Button
                                        type="primary"
                                        variant="filled"
                                        icon={<ArrowDownOutlined/>}
                                        size="large"
                                        href='nzinclopedia.csv'
                                        target="_blank">
                                        Download the database
                                    </Button>
                                </Tooltip>
                                <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
                                    <Button
                                        variant="filled"
                                        icon={darkMode ? <SunOutlined/> : <MoonOutlined/>}
                                        size="large"
                                        onClick={() => {setDarkMode(!darkMode)}}
                                    />
                                </Tooltip>
                            </Flex>
                        </Flex>
                    </Layout.Header>
                    <Layout.Content>
                        <DataTable darkMode={darkMode}/>
                        <div id="references">
                            <p>
                                Mechtinger, G., Axel, G., Kolodny, R., & Ben‐Tal, N. (2025). Interpretable prediction of zinc ion location in proteins with ZincSight. Protein Science, 34(11), e70350.&nbsp;
                                <a href="https://doi.org/10.1002/pro.70350">https://doi.org/10.1002/pro.70350</a>
                            </p>
                        </div>
                    </Layout.Content>
                </Layout>
            </App>
        </ConfigProvider>
    )
}

export default Main