"use client";

import { useState, useEffect } from 'react';
import { Container, Stack, Form, Button, Modal, Col, Row, ListGroup, ListGroupItem } from 'react-bootstrap';

export default function PaperRollForm() {

    const [rows, setRows] = useState([]);

    const [activeIndex, setActiveIndex] = useState(null);

    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    const suggestions = [
        'M/AP/950/110',
        'M/AP/950/140',
        'M/AP/100/110',
        'M/AP/110/110',
        'M/AP/115/110',
        'T/LE/900/140',
        'T/LE/900/150',
        'K/LE/950/200',
        'K/LE/900/140'
    ];

    useEffect(() => {
        handleAddRow();
    }, [])

    const handleChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);

        if(field === 'paperType'){
            setActiveIndex(index);
            if (value.trim() === ""){
                setFilteredSuggestions([]);
                return;
            }

            const lower = value.toLowerCase();
            const matched = suggestions.filter((item) => 
                item.toLowerCase().includes(lower)
            );

            setFilteredSuggestions(matched);
        }
    };

    const handleSelectSuggestion = (index, value) => {
        const updatedRows = [...rows];
        updatedRows[index].paperType = value;
        setRows(updatedRows);
        setFilteredSuggestions([]);
        setActiveIndex(null);
    }

    const handleAddRow = () => {
        const newRows = Array.from({ length: 10 }, () => ({
            paperType: '',
            weight: '',
            createdDate: '',
        }));

        setRows(rows => [...rows, ...newRows]);

    };

    const handleRemoveRow = (index) => {
        const updatedRows = rows.filter((_, i) => i !== index);
        setRows(updatedRows);
    }

    const handleSubmit = (e) => {

        const filteredRows = rows.filter(row => 
            row.paperType.trim() !== '' ||
            row.weight.trim() !== '' ||
            row.createdDate.trim() !== ''
        );

        setRows(filteredRows);

        e.preventDefault();
        console.log('Submitted data:', rows);
    };

    return (
        <Container className="mt-5 p-4" style={{ background: '#D5E8D4' }}>
            <h4 className="text-center mb-4 fw-bold">NHẬP CUỘN GIẤY MỚI</h4>

            <Form onSubmit={handleSubmit}>
                {rows.map((row, index) => (
                    <Row key={index} className='mb-3'>
                        <Form.Group as={Col}>
                            <Form.Control
                                type='text'
                                placeholder='Tên giấy'
                                autoComplete='off'
                                value={row.paperType}
                                onChange={(e) => handleChange(index, 'paperType', e.target.value)}
                                onFocus={() => {
                                    setActiveIndex(index);
                                    if (row.paperType){
                                        const matched = suggestions.filter((item) => 
                                        item.toLowerCase()
                                            .includes(rows.paperType.toLowerCase())
                                        );
                                        setFilteredSuggestions(matched);
                                    }
                                }}

                                onBlur={() => {
                                    setTimeout(() => {
                                        setTimeout(() => setFilteredSuggestions([]), 150);
                                    })
                                }}
                            />

                            {activeIndex === index && filteredSuggestions.length > 0 && (
                                <ListGroup 
                                    className='position-absolute w-100 mt-1 shadow-sm'
                                    style={{zIndex: 1000}}>
                                        {filteredSuggestions.map((suggest, i) => (
                                            <ListGroup.Item
                                                key={i}
                                                action
                                                onClick={() => handleSelectSuggestion(index, suggest)}
                                                >
                                                    {suggest}
                                                </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                            )}
                        </Form.Group>

                        <Form.Group as={Col}>
                            <Form.Control
                                type='number'
                                min={1}
                                placeholder='Trọng lượng'
                                value={row.weight}
                                onChange={(e) => handleChange(index, 'weight', e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group as={Col}>
                            <Form.Control
                                type='date'
                                value={row.createdDate}
                                onChange={(e) => handleChange(index, 'createdDate', e.target.value)}
                            />
                        </Form.Group>

                        <Col xs='auto'>
                            <Button variant='danger' onClick={() => handleRemoveRow(index)}>
                                Xóa
                            </Button>
                        </Col>
                    </Row>
                ))}
                <Button variant='secondary' onClick={handleAddRow}>
                    Thêm 10 dòng
                </Button>

                <Button variant='primary' type='submit'>
                    Lưu
                </Button>
            </Form>

        </Container>
    );
}
