import {App, Button, ConfigProvider, Flex, Layout, theme} from 'antd'
import DataTable from './DataTable.tsx'
import {useEffect, useState} from 'react'
import {DownloadOutlined, MoonOutlined, SunOutlined} from '@ant-design/icons'


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
                            <Flex flex={1}>n-zinclopedia</Flex>
                            <Flex align="center" gap="small">
                                <Button
                                    variant="filled"
                                    icon={<DownloadOutlined/>}
                                    href='nzinclopedia.csv'
                                    target="_blank">
                                    Download n-zinclopedia data
                                </Button>
                                <Button
                                    variant="filled"
                                    icon={darkMode ? <SunOutlined/> : <MoonOutlined/>}
                                    onClick={() => {setDarkMode(!darkMode)}}
                                />
                            </Flex>
                        </Flex>
                    </Layout.Header>
                    <Layout.Content>
                        <DataTable darkMode={darkMode}/>
                    </Layout.Content>
                </Layout>
            </App>
        </ConfigProvider>
    )
}

export default Main