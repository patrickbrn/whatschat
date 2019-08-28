package de.tub.ise.anwsys;

import java.util.Date;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import de.tub.ise.anwsys.model.Channel;
import de.tub.ise.anwsys.model.Message;
import de.tub.ise.anwsys.repositories.MessageRepository;

/**
 * InitTestDataInDB
 *
 * Created on 07.07.2019
 *
 * Copyright (C) 2019 Volkswagen AG, All rights reserved.
 */
@Configuration
public class InitTestDataInDB {


    @Bean
    CommandLineRunner initDB(final MessageRepository messageRepo){

        return args -> {

            System.out.println("initializing db");
            final Message message = new Message();
            message.setContent("testContent");
            message.setCreator("testUser");
            message.setDate(new Date());


            final Channel channel = new Channel();
            channel.setChannelName("testName");
            channel.setChannelTopic("testTopic");

            message.setChannel(channel);

            messageRepo.save(message);
        };
    }
}
