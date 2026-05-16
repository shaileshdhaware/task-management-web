import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthState } from '../types';

function NavbarComponent() {
    const navigate = useNavigate();
    
    const [auth, setAuth] = useState<AuthState>({
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role') as AuthState['role']
    });

    useEffect(() => {
        setAuth({ token: localStorage.getItem('token'), role: localStorage.getItem('role') as AuthState['role'] });
    }, [localStorage.getItem('token')])


    const goToLogin = () => {
        navigate('/login');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        setAuth({ token: null, role: null });
        navigate('/dashboard');
    };

    return (
        <Navbar bg="dark" data-bs-theme="dark">
            <Container>
                <Navbar.Brand href="/dashboard">Navbar</Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link href="/dashboard">Home</Nav.Link>
                </Nav>
                {auth.token ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: "white" }}>
                            Welcome {auth.role}
                        </span>
                        <Nav>
                            <input
                                type="button"
                                name="logout"
                                value="Logout"
                                onClick={logout}
                            />
                        </Nav>
                    </div>
                ) : (
                    <Nav>
                        <input
                            type="button"
                            name="login"
                            value="Login"
                            onClick={goToLogin}
                        />
                    </Nav>
                )}
            </Container>
        </Navbar>
    );
}

export default NavbarComponent;
