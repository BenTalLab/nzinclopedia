import {CheckOutlined, ExportOutlined, LoadingOutlined, PercentageOutlined} from '@ant-design/icons'
import type {InputRef, TableColumnType} from 'antd'
import {Button, Flex, Input, InputNumber, Progress, Result, Space, Spin, Table, Tag} from 'antd'
import Papa, {type ParseResult} from 'papaparse'
import {useEffect, useRef, useState} from 'react'
import _, {camelCase} from 'lodash'
import type {PredictionDetails} from './types.ts'
import type {InputNumberRef} from '@rc-component/input-number'
import MolstarViewer from './MolstarViewer.tsx'

const percentageColors = [
    '#FF0000',
    '#FF4000',
    '#FF8000',
    '#FFBF00',
    '#FFD230',
    '#D4FF00',
    '#AAFF00',
    '#55FF00'
]

const sources = [
    'Dark Proteome',
    'MDH H-like β-propeller',
    'Rossmann',
    'TIM barrel',
    'TED'
]

const DataTable = ({darkMode}: {darkMode: boolean}) => {

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [data, setData] = useState<PredictionDetails[]>(null as unknown as PredictionDetails[])
    const [modalDetails, setModalDetails] = useState<PredictionDetails | null>(null)

    const structureIdSearchInput = useRef<InputRef>(null)
    const minProbabilityInput = useRef<InputNumberRef>(null)

    useEffect(() => {

        Papa.parse('data.csv', {
            download: true,
            header: true,
            delimiter: ',',
            skipEmptyLines: true,
            transformHeader: camelCase,
            transform: (value: string, header: string) => {
                switch(header) {
                    case 'source':
                        return sources[parseInt(value)-1]
                    case 'coord':
                        return value.split(',').map(parseFloat)
                    case 'zincsight':
                        return parseFloat(value)
                    case 'mahomesii':
                        return value === '1'
                }
                return value
            },
            complete: ({data, errors}: ParseResult<PredictionDetails>) => {
                if (errors.length > 0) {
                    setError(true)
                } else {
                    data = data.map((row, key) => ({...row, key}))
                    setData(data)
                }
                setLoading(false)
            }
        })
    }, [])

    if(loading) {
        return (
            <Flex justify='center' align='center' style={{height: '100vh'}}>
                <Spin indicator={<LoadingOutlined style={{fontSize: 96}} spin/>}/>
            </Flex>
        )
    }

    if(error) {
        return(
            <Flex justify='center' align='center' style={{height: '100vh'}}>
                <Result status='error' title='Data temporarily unavailable'/>
            </Flex>
        )
    }

    const columns: TableColumnType<PredictionDetails>[] = [
        {
            key: 'source',
            dataIndex: 'source',
            title: 'Source',
            sorter: (a, b) => a.source.localeCompare(b.source),
            width: 200,
            filters: _(data).map('source').uniq().sortedUniq().map(value => ({value, text: value})).value(),
            onFilter: (value, record) => record.source === value
        },
        {
            key: 'uniprot',
            dataIndex: 'uniprot',
            title: 'UniProt Accession',
            sorter: (a, b) => a.uniprot.localeCompare(b.uniprot),
            width: 220,
            filterDropdown: ({confirm, setSelectedKeys}) =>
                <div style={{padding: 10}}>
                    <Input.Search
                        enterButton
                        allowClear
                        ref={structureIdSearchInput} placeholder='Enter UniProt accession'
                        onSearch={value => {
                            setSelectedKeys(value.trim() ? [value] : [])
                            confirm()
                        }}
                    />
                </div>,
            onFilter: (value, record) =>
                record.uniprot.toLowerCase() === (value as string).trim().toLowerCase(),
            filterDropdownProps: {
                onOpenChange: open => {
                    if(open) {
                        setTimeout(() => structureIdSearchInput.current?.select(), 100)
                    }
                }
            }
        },
        {
            key: 'residues',
            dataIndex: 'residues',
            title: 'Binding Residues',
            sorter: (a, b) => a.residues.localeCompare(b.residues),
            width: 200,
            onCell: () => ({style: {fontSize: 20, letterSpacing: 10}}),
            filters: _(data).map('residues').uniq().sortedUniq().map(value => ({value, text: value})).value(),
            onFilter: (value, record) => record.residues === value
        },
        {
            key: 'zincsight',
            dataIndex: 'zincsight',
            title: 'ZincSight %',
            render: value => <Progress success={{percent: 0}} percent={value} steps={10} size='small' strokeColor={percentageColors[Math.min(7, Math.round(value / 10))]}/>,
            width: 200,
            sorter: (a, b) => a.zincsight - b.zincsight,
            filterDropdown: ({confirm, setSelectedKeys}) =>
                <Space.Compact style={{padding: 10}}>
                    <InputNumber
                        ref={minProbabilityInput}
                        style={{width: 120}}
                        defaultValue={0}
                        min={0}
                        max={100}
                        placeholder='Minimum'
                        suffix={<PercentageOutlined/>}
                        onPressEnter={() => {
                            setSelectedKeys(minProbabilityInput.current!.value ? [parseFloat(minProbabilityInput.current!.value)] : [])
                            confirm()
                        }}
                    />
                    <Button
                        type='primary'
                        icon={<CheckOutlined/>}
                        onClick={() => {
                            setSelectedKeys(minProbabilityInput.current!.value ? [parseFloat(minProbabilityInput.current!.value)] : [])
                            confirm()
                        }}
                    />
                </Space.Compact>,
            onFilter: (value, record) =>
                record.zincsight >= (value as number),
            filterDropdownProps: {
                onOpenChange: open => {
                    if(open) {
                        setTimeout(() => minProbabilityInput.current?.select(), 100)
                    }
                }
            }
        },
        {
            key: 'mahomesii',
            dataIndex: 'mahomesii',
            title: 'MAHOMES II',
            width: 180,
            sorter: (a, b) => (a.mahomesii as unknown as number) - (b.mahomesii as unknown as number),
            render: value => value ?
                <Tag style={{width: 100, textAlign: 'center'}} variant='outlined' color='green'>Catalytic</Tag> :
                <Tag style={{width: 100, textAlign: 'center'}} variant='outlined' color='red'>Not Catalytic</Tag>,
            filters: [{value: true, text: 'Catalytic'}, {value: false, text: 'Not Catalytic'}],
            onFilter: (value, record) => record.mahomesii === value
        },
        {
            key: 'actions',
            render: (_: unknown, details: PredictionDetails) =>
                <Button icon={<ExportOutlined />} onClick={() => setModalDetails(details)}>3D View</Button>
        }
    ]

    return(
        <>
            <Table columns={columns} dataSource={data} style={{maxWidth: 1200, margin: '30px auto'}}/>
            <MolstarViewer darkMode={darkMode} details={modalDetails} onClose={() => setModalDetails(null)}/>
        </>
    )
}

export default DataTable