package de.tub.ise.anwsys.filter;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Authorization
 *
 * Created on 07.07.2019
 *
 * Copyright (C) 2019 Volkswagen AG, All rights reserved.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AuthorizationFilter extends OncePerRequestFilter {

    private static final String X_GROUP_TOKEN = "ghwPcrQQYrPI";
    private static final String AUTHORIZATION_HEADER = "X-Group-Token";

    @Override
    protected void doFilterInternal(final HttpServletRequest httpServletRequest,
                                    final HttpServletResponse httpServletResponse,
                                    final FilterChain filterChain) throws IOException, ServletException {

        //Im folgendem wird der Token Header Validert
        final String headerToken = httpServletRequest.getHeader(AUTHORIZATION_HEADER);
//todo remove true
        if (!X_GROUP_TOKEN.equals(headerToken) && false) {
            httpServletResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } else {
            filterChain.doFilter(httpServletRequest, httpServletResponse);
        }
    }
}
